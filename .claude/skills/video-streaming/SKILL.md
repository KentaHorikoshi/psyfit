---
name: video-streaming
description: 動画配信・アクセス制御の実装。セッション認証、運動メニュー割当確認、一時トークン発行、Range requestサポートを含む。
---

# Video Streaming Skill

動画配信・アクセス制御の実装手順。

## 参照ドキュメント

- [セキュリティ要件 - 動画配信](../../docs/05-security-requirements.md#3-動画配信のアクセス制御)

## 概要

- 動画は自社サーバー内に格納
- Rails API経由でアクセス制御
- セッション認証 + 運動メニュー割当確認 + 一時トークン

## ディレクトリ構成

```
storage/
└── videos/
    ├── squat.mp4
    ├── balance.mp4
    └── stretch.mp4
```

## 実装

### 1. ルーティング

```ruby
# config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :videos, only: [:show] do
        member do
          get :stream
        end
      end
    end
  end
end
```

### 2. コントローラー

```ruby
# app/controllers/api/v1/videos_controller.rb
module Api
  module V1
    class VideosController < ApplicationController
      before_action :authenticate_user!
      before_action :authorize_video_access, only: [:show, :stream]

      # GET /api/v1/videos/:id
      # 動画情報と一時トークン付きストリームURLを返す
      def show
        token = generate_video_token(@video.id)

        render json: {
          status: 'success',
          data: {
            id: @video.id,
            name: @video.exercise.name,
            duration_seconds: @video.duration_seconds,
            stream_url: stream_api_v1_video_url(@video, token: token),
            expires_at: 5.minutes.from_now.iso8601
          }
        }
      end

      # GET /api/v1/videos/:id/stream?token=xxx
      # 動画ファイルをストリーミング配信
      def stream
        verify_video_token!

        video_path = Rails.root.join('storage', 'videos', @video.filename)

        unless File.exist?(video_path)
          render json: { status: 'error', message: '動画が見つかりません' },
                 status: :not_found
          return
        end

        # Range requestサポート（シーク対応）
        if request.headers['Range']
          send_range_video(video_path)
        else
          send_file video_path,
                    type: 'video/mp4',
                    disposition: 'inline',
                    stream: true
        end
      end

      private

      def authorize_video_access
        @video = Video.find(params[:id])
        exercise = @video.exercise

        unless current_user.patient_exercises.active.exists?(exercise_id: exercise.id)
          render json: { status: 'error', message: 'この動画へのアクセス権限がありません' },
                 status: :forbidden
        end
      end

      def generate_video_token(video_id)
        payload = {
          user_id: current_user.id,
          video_id: video_id,
          exp: 5.minutes.from_now.to_i
        }
        JWT.encode(payload, Rails.application.secret_key_base, 'HS256')
      end

      def verify_video_token!
        token = params[:token]

        unless token
          render json: { status: 'error', message: 'トークンが必要です' },
                 status: :unauthorized
          return
        end

        begin
          payload = JWT.decode(token, Rails.application.secret_key_base, true, algorithm: 'HS256')[0]

          unless payload['user_id'] == current_user.id && payload['video_id'] == @video.id
            raise JWT::InvalidPayload
          end
        rescue JWT::ExpiredSignature
          render json: { status: 'error', message: 'トークンの有効期限が切れています' },
                 status: :unauthorized
        rescue JWT::InvalidPayload, JWT::DecodeError
          render json: { status: 'error', message: '無効なトークンです' },
                 status: :unauthorized
        end
      end

      def send_range_video(video_path)
        file_size = File.size(video_path)
        range = request.headers['Range']

        # Range: bytes=0-1023 形式をパース
        if range =~ /bytes=(\d+)-(\d*)/
          start_pos = $1.to_i
          end_pos = $2.present? ? $2.to_i : file_size - 1
          end_pos = [end_pos, file_size - 1].min

          length = end_pos - start_pos + 1

          response.headers['Content-Range'] = "bytes #{start_pos}-#{end_pos}/#{file_size}"
          response.headers['Accept-Ranges'] = 'bytes'
          response.headers['Content-Length'] = length.to_s
          response.headers['Content-Type'] = 'video/mp4'

          self.status = 206 # Partial Content

          File.open(video_path, 'rb') do |file|
            file.seek(start_pos)
            self.response_body = file.read(length)
          end
        else
          send_file video_path, type: 'video/mp4', disposition: 'inline'
        end
      end
    end
  end
end
```

### 3. モデル

```ruby
# app/models/video.rb
class Video < ApplicationRecord
  belongs_to :exercise

  validates :filename, presence: true
  validates :duration_seconds, numericality: { greater_than: 0 }, allow_nil: true

  def file_path
    Rails.root.join('storage', 'videos', filename)
  end

  def exists?
    File.exist?(file_path)
  end
end

# app/models/exercise.rb
class Exercise < ApplicationRecord
  has_one :video, dependent: :destroy
  has_many :patient_exercises
  has_many :users, through: :patient_exercises
end

# app/models/patient_exercise.rb
class PatientExercise < ApplicationRecord
  belongs_to :user
  belongs_to :exercise
  belongs_to :assigned_by_staff, class_name: 'Staff'

  scope :active, -> { where(is_active: true) }
end
```

## フロントエンド実装

```tsx
// src_user/components/VideoPlayer.tsx
import { useState, useEffect, useRef } from 'react';

interface VideoPlayerProps {
  videoId: string;
}

export function VideoPlayer({ videoId }: VideoPlayerProps) {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchVideoUrl();
  }, [videoId]);

  const fetchVideoUrl = async () => {
    try {
      const response = await fetch(`/api/v1/videos/${videoId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('動画の取得に失敗しました');
      }

      const data = await response.json();
      setStreamUrl(data.data.stream_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラー');
    }
  };

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!streamUrl) {
    return <div>読み込み中...</div>;
  }

  return (
    <video
      ref={videoRef}
      src={streamUrl}
      controls
      className="w-full rounded-lg"
      playsInline
      controlsList="nodownload"
    >
      お使いのブラウザは動画再生に対応していません。
    </video>
  );
}
```

## セキュリティ考慮事項

### チェックリスト

- [x] セッション認証必須
- [x] 運動メニュー割当確認
- [x] 一時トークン（5分間有効）
- [x] ダウンロード禁止（controlsList="nodownload"）
- [ ] Refererチェック（オプション）
- [ ] IPアドレス制限（オプション）

### Refererチェック追加

```ruby
# app/controllers/api/v1/videos_controller.rb
before_action :check_referer, only: [:stream]

private

def check_referer
  allowed_origins = [
    Rails.application.config.frontend_origin,
    'http://localhost:5173'
  ]

  referer = request.referer
  return if referer.nil? # 直接アクセスは許可しない

  unless allowed_origins.any? { |origin| referer.start_with?(origin) }
    render json: { status: 'error', message: '不正なリクエスト' },
           status: :forbidden
  end
end
```

## 動画ファイル管理

### アップロード

```ruby
# 管理者用の動画アップロード（将来実装）
# ActiveStorage を使用する場合
class Video < ApplicationRecord
  has_one_attached :file

  def filename
    file.attached? ? file.filename.to_s : read_attribute(:filename)
  end
end
```

### サポート形式

| 形式 | MIME Type | 推奨 |
|------|-----------|------|
| MP4 (H.264) | video/mp4 | 推奨 |
| WebM (VP9) | video/webm | サブ |

### ファイルサイズ目安

| 動画長 | 720p | 1080p |
|--------|------|-------|
| 1分 | 10-15MB | 20-30MB |
| 5分 | 50-75MB | 100-150MB |
