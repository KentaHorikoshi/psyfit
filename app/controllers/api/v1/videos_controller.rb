# frozen_string_literal: true

# Videos Controller for video streaming access control
# Provides:
# - Token generation for authenticated users
# - Video streaming with Range request support
# - Audit logging for video access
#
# Security:
# - Session authentication required
# - Exercise assignment verification
# - Token-based streaming authorization
module Api
  module V1
    class VideosController < BaseController
      before_action :authenticate_user!, only: [ :token ]
      before_action :set_exercise, only: [ :token, :stream ]
      before_action :verify_exercise_assignment, only: [ :token ]

      # GET /api/v1/videos/:exercise_id/token
      # Generate a temporary access token for video streaming
      def token
        access_token = VideoAccessToken.generate_for(
          user: current_user,
          exercise: @exercise
        )

        render_success({
          token: access_token.token,
          expires_at: access_token.expires_at.iso8601,
          exercise_id: @exercise.id
        })
      end

      # GET /api/v1/videos/:exercise_id/stream
      # Stream video content with token verification
      def stream
        token_string = params[:token]

        if token_string.blank?
          return render_error("\u30C8\u30FC\u30AF\u30F3\u304C\u5FC5\u8981\u3067\u3059", status: :unauthorized)
        end

        access_token = VideoAccessToken.find_valid_token(token_string)

        if access_token.nil?
          return render_error("\u30C8\u30FC\u30AF\u30F3\u304C\u7121\u52B9\u307E\u305F\u306F\u671F\u9650\u5207\u308C\u3067\u3059", status: :unauthorized)
        end

        if access_token.exercise_id != @exercise.id
          return render_error("\u30C8\u30FC\u30AF\u30F3\u3068\u52D5\u753B\u304C\u4E00\u81F4\u3057\u307E\u305B\u3093", status: :forbidden)
        end

        if access_token.user_id != current_user&.id
          if current_user.nil?
            return render_error("\u8A8D\u8A3C\u304C\u5FC5\u8981\u3067\u3059", status: :unauthorized)
          end
          return render_error("\u3053\u306E\u30C8\u30FC\u30AF\u30F3\u3078\u306E\u30A2\u30AF\u30BB\u30B9\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093", status: :forbidden)
        end

        video = @exercise.primary_video
        if video.nil?
          return render_error("\u52D5\u753B\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093", status: :not_found)
        end

        video_path = resolve_video_path(video.video_url)

        unless File.exist?(video_path)
          return render_error("\u52D5\u753B\u30D5\u30A1\u30A4\u30EB\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093", status: :not_found)
        end

        # Record audit log
        AuditLog.log_video_access(
          user: access_token.user,
          video_id: video.id,
          ip_address: client_ip
        )

        # Stream the video
        stream_video(video_path)
      end

      private

      def set_exercise
        @exercise = Exercise.find(params[:exercise_id])
      end

      def verify_exercise_assignment
        assignment = PatientExercise.active.find_by(user: current_user, exercise: @exercise)

        if assignment.nil?
          render_forbidden("\u3053\u306E\u52D5\u753B\u3078\u306E\u30A2\u30AF\u30BB\u30B9\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093")
        end
      end

      def resolve_video_path(video_url)
        # Always resolve to storage/videos/ using the filename
        Rails.root.join("storage", "videos", File.basename(video_url))
      end

      def stream_video(video_path)
        file_size = File.size(video_path)
        content_type = "video/mp4"

        # Set common headers
        response.headers["Accept-Ranges"] = "bytes"
        response.headers["Content-Type"] = content_type

        if request.headers["Range"].present?
          stream_partial_content(video_path, file_size)
        else
          stream_full_content(video_path, file_size)
        end
      end

      def stream_partial_content(video_path, file_size)
        range_header = request.headers["Range"]
        ranges = parse_range_header(range_header, file_size)

        if ranges.nil?
          head :range_not_satisfiable
          return
        end

        start_pos, end_pos = ranges
        content_length = end_pos - start_pos + 1

        response.headers["Content-Range"] = "bytes #{start_pos}-#{end_pos}/#{file_size}"
        response.headers["Content-Length"] = content_length.to_s

        response.status = :partial_content

        send_file_range(video_path, start_pos, content_length)
      end

      def stream_full_content(video_path, file_size)
        response.headers["Content-Length"] = file_size.to_s

        send_file video_path,
                  type: "video/mp4",
                  disposition: "inline",
                  status: :ok
      end

      def parse_range_header(range_header, file_size)
        return nil unless range_header =~ /^bytes=(\d*)-(\d*)$/

        start_pos = ::Regexp.last_match(1).presence&.to_i || 0
        end_pos = ::Regexp.last_match(2).presence&.to_i || (file_size - 1)

        # Validate range
        return nil if start_pos > end_pos
        return nil if start_pos >= file_size

        # Clamp end_pos to file size
        end_pos = [ end_pos, file_size - 1 ].min

        [ start_pos, end_pos ]
      end

      def send_file_range(video_path, start_pos, length)
        File.open(video_path, "rb") do |file|
          file.seek(start_pos)
          data = file.read(length)
          send_data data, type: "video/mp4", disposition: "inline"
        end
      end
    end
  end
end
