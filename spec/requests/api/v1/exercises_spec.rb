# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Exercises', type: :request do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:staff) { create(:staff) }

  let!(:exercise) do
    create(:exercise,
      name: 'スクワット',
      description: '下半身の筋力強化',
      exercise_type: 'トレーニング',
      difficulty: 'easy',
      recommended_reps: 10,
      recommended_sets: 3,
      video_url: '/videos/squat.mp4',
      thumbnail_url: '/thumbnails/squat.jpg',
      duration_seconds: 180
    )
  end

  let!(:unassigned_exercise) do
    create(:exercise,
      name: '片足立ち',
      description: 'バランス訓練',
      exercise_type: 'バランス',
      difficulty: 'medium'
    )
  end

  describe 'GET /api/v1/exercises/:id' do
    context 'when not authenticated' do
      it 'returns 401 unauthorized' do
        get "/api/v1/exercises/#{exercise.id}"

        expect(response).to have_http_status(:unauthorized)
        expect(json_response['status']).to eq('error')
        expect(json_response['message']).to include('認証')
      end
    end

    context 'when authenticated as user' do
      before { sign_in_as_user(user) }

      context 'with assigned exercise' do
        let!(:patient_exercise) do
          create(:patient_exercise,
            user: user,
            exercise: exercise,
            assigned_by_staff: staff,
            is_active: true
          )
        end

        it 'returns the exercise details' do
          get "/api/v1/exercises/#{exercise.id}"

          expect(response).to have_http_status(:ok)
          expect(json_response['status']).to eq('success')
          expect(json_response['data']).to include(
            'id' => exercise.id,
            'name' => 'スクワット',
            'description' => '下半身の筋力強化',
            'exercise_type' => 'training',
            'reps' => 10,
            'sets' => 3,
            'video_url' => '/videos/squat.mp4',
            'thumbnail_url' => '/thumbnails/squat.jpg',
            'duration_seconds' => 180
          )
        end

        it 'creates audit log entry' do
          expect {
            get "/api/v1/exercises/#{exercise.id}"
          }.to change(AuditLog, :count).by(1)

          audit = AuditLog.order(:created_at).last
          expect(audit.action).to eq('read')
          expect(audit.status).to eq('success')
          expect(audit.user_id).to eq(user.id)
          expect(audit.user_type).to eq('user')
          info = JSON.parse(audit.additional_info)
          expect(info['resource_type']).to eq('Exercise')
          expect(info['exercise_id']).to eq(exercise.id)
        end
      end

      context 'with inactive assignment' do
        let!(:inactive_patient_exercise) do
          create(:patient_exercise,
            user: user,
            exercise: exercise,
            assigned_by_staff: staff,
            is_active: false
          )
        end

        it 'returns 403 forbidden' do
          get "/api/v1/exercises/#{exercise.id}"

          expect(response).to have_http_status(:forbidden)
          expect(json_response['status']).to eq('error')
        end
      end

      context 'with unassigned exercise' do
        it 'returns 403 forbidden' do
          get "/api/v1/exercises/#{unassigned_exercise.id}"

          expect(response).to have_http_status(:forbidden)
          expect(json_response['status']).to eq('error')
        end
      end

      context 'with exercise assigned to another user' do
        let!(:other_user_assignment) do
          create(:patient_exercise,
            user: other_user,
            exercise: exercise,
            assigned_by_staff: staff,
            is_active: true
          )
        end

        it 'returns 403 forbidden' do
          get "/api/v1/exercises/#{exercise.id}"

          expect(response).to have_http_status(:forbidden)
          expect(json_response['status']).to eq('error')
        end
      end

      context 'with non-existent exercise' do
        it 'returns 404 not found' do
          get '/api/v1/exercises/non-existent-id'

          expect(response).to have_http_status(:not_found)
          expect(json_response['status']).to eq('error')
        end
      end
    end

    context 'when staff is authenticated' do
      before { sign_in_as_staff(staff) }

      it 'returns 401 unauthorized (user-only endpoint)' do
        get "/api/v1/exercises/#{exercise.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'session timeout' do
      let!(:patient_exercise) do
        create(:patient_exercise,
          user: user,
          exercise: exercise,
          assigned_by_staff: staff,
          is_active: true
        )
      end

      it 'returns unauthorized after 30 minutes of inactivity' do
        sign_in_as_user(user)

        Timecop.travel(31.minutes.from_now) do
          get "/api/v1/exercises/#{exercise.id}"

          expect(response).to have_http_status(:unauthorized)
        end
      end

      it 'allows access within 30 minutes' do
        sign_in_as_user(user)

        Timecop.travel(29.minutes.from_now) do
          get "/api/v1/exercises/#{exercise.id}"

          expect(response).to have_http_status(:ok)
        end
      end
    end
  end
end
