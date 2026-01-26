# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Videos', type: :request do
  let(:user) { create(:user) }
  let(:staff) { create(:staff) }
  let(:exercise) { create(:exercise) }
  let(:video) { create(:video, exercise: exercise) }

  before do
    # 患者にexerciseを割り当てる
    create(:patient_exercise, user: user, exercise: exercise, assigned_by_staff: staff)
    video # ensure video is created
  end

  describe 'GET /api/v1/videos/:exercise_id/token' do
    context 'when user is authenticated' do
      before { sign_in_as_user(user) }

      it 'returns a new access token' do
        get "/api/v1/videos/#{exercise.id}/token"

        expect(response).to have_http_status(:ok)
        json = json_response
        expect(json['status']).to eq('success')
        expect(json['data']['token']).to be_present
        expect(json['data']['expires_at']).to be_present
        expect(json['data']['exercise_id']).to eq(exercise.id)
      end

      it 'creates a VideoAccessToken record' do
        expect {
          get "/api/v1/videos/#{exercise.id}/token"
        }.to change(VideoAccessToken, :count).by(1)

        token = VideoAccessToken.last
        expect(token.user).to eq(user)
        expect(token.exercise).to eq(exercise)
      end

      context 'when exercise is not assigned to user' do
        let(:unassigned_exercise) { create(:exercise) }
        let!(:unassigned_video) { create(:video, exercise: unassigned_exercise) }

        it 'returns 403 forbidden' do
          get "/api/v1/videos/#{unassigned_exercise.id}/token"

          expect(response).to have_http_status(:forbidden)
          json = json_response
          expect(json['status']).to eq('error')
          expect(json['message']).to include('アクセス権限がありません')
        end
      end

      context 'when exercise does not exist' do
        it 'returns 404 not found' do
          get "/api/v1/videos/#{SecureRandom.uuid}/token"

          expect(response).to have_http_status(:not_found)
        end
      end

      context 'when patient_exercise is inactive' do
        before do
          PatientExercise.find_by(user: user, exercise: exercise).deactivate!
        end

        it 'returns 403 forbidden' do
          get "/api/v1/videos/#{exercise.id}/token"

          expect(response).to have_http_status(:forbidden)
          json = json_response
          expect(json['status']).to eq('error')
        end
      end
    end

    context 'when user is not authenticated' do
      it 'returns 401 unauthorized' do
        get "/api/v1/videos/#{exercise.id}/token"

        expect(response).to have_http_status(:unauthorized)
        json = json_response
        expect(json['status']).to eq('error')
        expect(json['message']).to include('認証')
      end
    end
  end

  describe 'GET /api/v1/videos/:exercise_id/stream' do
    let(:valid_token) { VideoAccessToken.generate_for(user: user, exercise: exercise) }

    context 'with valid token' do
      before { sign_in_as_user(user) }

      it 'returns video content with correct content type' do
        # テスト用の動画ファイルパスを設定
        video.update!(video_url: '/storage/videos/test_video.mp4')

        # テスト用のダミー動画ファイルを作成
        video_path = Rails.root.join('storage', 'videos', 'test_video.mp4')
        FileUtils.mkdir_p(File.dirname(video_path))
        File.write(video_path, 'dummy video content for testing')

        get "/api/v1/videos/#{exercise.id}/stream", params: { token: valid_token.token }

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include('video/mp4')

        # cleanup
        FileUtils.rm_f(video_path)
      end

      it 'records audit log for video access' do
        video.update!(video_url: '/storage/videos/test_video.mp4')
        video_path = Rails.root.join('storage', 'videos', 'test_video.mp4')
        FileUtils.mkdir_p(File.dirname(video_path))
        File.write(video_path, 'dummy video content for testing')

        expect {
          get "/api/v1/videos/#{exercise.id}/stream", params: { token: valid_token.token }
        }.to change { AuditLog.where(action: 'video_access').count }.by(1)

        audit_log = AuditLog.where(action: 'video_access').last
        expect(audit_log.user).to eq(user)
        expect(audit_log.status).to eq('success')

        FileUtils.rm_f(video_path)
      end

      context 'with Range header' do
        it 'supports partial content (Range request)' do
          video.update!(video_url: '/storage/videos/test_video.mp4')
          video_path = Rails.root.join('storage', 'videos', 'test_video.mp4')
          FileUtils.mkdir_p(File.dirname(video_path))
          # 100バイトのダミーデータを作成
          File.write(video_path, 'a' * 100)

          get "/api/v1/videos/#{exercise.id}/stream",
              params: { token: valid_token.token },
              headers: { 'Range' => 'bytes=0-49' }

          expect(response).to have_http_status(:partial_content)
          expect(response.headers['Content-Range']).to be_present
          expect(response.headers['Accept-Ranges']).to eq('bytes')

          FileUtils.rm_f(video_path)
        end

        it 'returns full content when Range is not specified' do
          video.update!(video_url: '/storage/videos/test_video.mp4')
          video_path = Rails.root.join('storage', 'videos', 'test_video.mp4')
          FileUtils.mkdir_p(File.dirname(video_path))
          File.write(video_path, 'dummy video content for testing')

          get "/api/v1/videos/#{exercise.id}/stream", params: { token: valid_token.token }

          expect(response).to have_http_status(:ok)
          expect(response.headers['Accept-Ranges']).to eq('bytes')

          FileUtils.rm_f(video_path)
        end

        it 'returns 416 for invalid Range header' do
          video.update!(video_url: '/storage/videos/test_video.mp4')
          video_path = Rails.root.join('storage', 'videos', 'test_video.mp4')
          FileUtils.mkdir_p(File.dirname(video_path))
          File.write(video_path, 'a' * 100)

          # Range start > end (invalid)
          get "/api/v1/videos/#{exercise.id}/stream",
              params: { token: valid_token.token },
              headers: { 'Range' => 'bytes=50-10' }

          expect(response).to have_http_status(:range_not_satisfiable)

          FileUtils.rm_f(video_path)
        end

        it 'returns 416 for Range start beyond file size' do
          video.update!(video_url: '/storage/videos/test_video.mp4')
          video_path = Rails.root.join('storage', 'videos', 'test_video.mp4')
          FileUtils.mkdir_p(File.dirname(video_path))
          File.write(video_path, 'a' * 100)

          # Range start >= file size (invalid)
          get "/api/v1/videos/#{exercise.id}/stream",
              params: { token: valid_token.token },
              headers: { 'Range' => 'bytes=100-150' }

          expect(response).to have_http_status(:range_not_satisfiable)

          FileUtils.rm_f(video_path)
        end

        it 'clamps end position to file size minus 1' do
          video.update!(video_url: '/storage/videos/test_video.mp4')
          video_path = Rails.root.join('storage', 'videos', 'test_video.mp4')
          FileUtils.mkdir_p(File.dirname(video_path))
          File.write(video_path, 'a' * 100)

          # Request beyond file size but start is valid
          get "/api/v1/videos/#{exercise.id}/stream",
              params: { token: valid_token.token },
              headers: { 'Range' => 'bytes=50-200' }

          expect(response).to have_http_status(:partial_content)
          expect(response.headers['Content-Range']).to eq('bytes 50-99/100')

          FileUtils.rm_f(video_path)
        end
      end
    end

    context 'when exercise has no video' do
      it 'returns 404 not found' do
        exercise_without_video = create(:exercise)
        create(:patient_exercise, user: user, exercise: exercise_without_video, assigned_by_staff: staff)
        no_video_token = VideoAccessToken.generate_for(user: user, exercise: exercise_without_video)

        sign_in_as_user(user)

        get "/api/v1/videos/#{exercise_without_video.id}/stream", params: { token: no_video_token.token }

        expect(response).to have_http_status(:not_found)
        json = json_response
        expect(json['message']).to include('見つかりません')
      end
    end

    context 'with expired token' do
      it 'returns 401 unauthorized' do
        expired_token = VideoAccessToken.generate_for(user: user, exercise: exercise)
        expired_token.update_column(:expires_at, 1.hour.ago)

        get "/api/v1/videos/#{exercise.id}/stream", params: { token: expired_token.token }

        expect(response).to have_http_status(:unauthorized)
        json = json_response
        expect(json['status']).to eq('error')
        expect(json['message']).to include('トークン')
      end
    end

    context 'with used token' do
      it 'returns 401 unauthorized' do
        used_token = VideoAccessToken.generate_for(user: user, exercise: exercise)
        used_token.mark_as_used!

        get "/api/v1/videos/#{exercise.id}/stream", params: { token: used_token.token }

        expect(response).to have_http_status(:unauthorized)
        json = json_response
        expect(json['status']).to eq('error')
      end
    end

    context 'with invalid token' do
      it 'returns 401 unauthorized' do
        get "/api/v1/videos/#{exercise.id}/stream", params: { token: 'invalid-token' }

        expect(response).to have_http_status(:unauthorized)
        json = json_response
        expect(json['status']).to eq('error')
      end
    end

    context 'without token' do
      it 'returns 401 unauthorized' do
        get "/api/v1/videos/#{exercise.id}/stream"

        expect(response).to have_http_status(:unauthorized)
        json = json_response
        expect(json['status']).to eq('error')
      end
    end

    context 'when token is for different exercise' do
      let(:other_exercise) { create(:exercise) }
      let(:other_video) { create(:video, exercise: other_exercise) }

      before do
        create(:patient_exercise, user: user, exercise: other_exercise, assigned_by_staff: staff)
        other_video
      end

      it 'returns 403 forbidden' do
        token_for_other = VideoAccessToken.generate_for(user: user, exercise: other_exercise)

        get "/api/v1/videos/#{exercise.id}/stream", params: { token: token_for_other.token }

        expect(response).to have_http_status(:forbidden)
        json = json_response
        expect(json['status']).to eq('error')
        expect(json['message']).to include('一致しません')
      end
    end

    context 'when video file does not exist' do
      before { sign_in_as_user(user) }

      it 'returns 404 not found' do
        video.update!(video_url: '/storage/videos/non_existent.mp4')

        get "/api/v1/videos/#{exercise.id}/stream", params: { token: valid_token.token }

        expect(response).to have_http_status(:not_found)
        json = json_response
        expect(json['message']).to include('見つかりません')
      end
    end

    context 'when accessing stream without session but with valid token for different user' do
      it 'returns 401 unauthorized when not logged in' do
        get "/api/v1/videos/#{exercise.id}/stream", params: { token: valid_token.token }

        expect(response).to have_http_status(:unauthorized)
        json = json_response
        expect(json['message']).to include('認証')
      end
    end

    context 'when video_url is external (not starting with /)' do
      before { sign_in_as_user(user) }

      it 'resolves to storage path using basename' do
        video.update!(video_url: 'https://example.com/videos/test_video.mp4')
        video_path = Rails.root.join('storage', 'videos', 'test_video.mp4')
        FileUtils.mkdir_p(File.dirname(video_path))
        File.write(video_path, 'dummy video content')

        get "/api/v1/videos/#{exercise.id}/stream", params: { token: valid_token.token }

        expect(response).to have_http_status(:ok)

        FileUtils.rm_f(video_path)
      end
    end
  end

  describe 'security tests' do
    describe 'token binding to user' do
      let(:other_user) { create(:user) }

      before do
        create(:patient_exercise, user: other_user, exercise: exercise, assigned_by_staff: staff)
      end

      it 'prevents using token generated for different user' do
        token_for_user = VideoAccessToken.generate_for(user: user, exercise: exercise)

        # 別のユーザーでログイン
        sign_in_as_user(other_user)

        # userのトークンを使ってother_userがアクセスしようとする
        get "/api/v1/videos/#{exercise.id}/stream", params: { token: token_for_user.token }

        expect(response).to have_http_status(:forbidden)
        json = json_response
        expect(json['message']).to include('アクセス権限')
      end
    end

    describe 'exercise assignment check' do
      it 'ensures token generation requires active assignment' do
        sign_in_as_user(user)

        # 割り当てを非アクティブにする
        PatientExercise.find_by(user: user, exercise: exercise).deactivate!

        get "/api/v1/videos/#{exercise.id}/token"

        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
