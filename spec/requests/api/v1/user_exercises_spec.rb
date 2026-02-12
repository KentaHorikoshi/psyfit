# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::UserExercises', type: :request do
  let(:user_password) { 'Password123!' }

  describe 'GET /api/v1/users/me/exercises' do
    context 'when not authenticated' do
      it 'returns unauthorized error' do
        get '/api/v1/users/me/exercises'

        expect(response).to have_http_status(:unauthorized)
        expect(json_response['status']).to eq('error')
        expect(json_response['message']).to include('認証')
      end
    end

    context 'when authenticated as user' do
      let!(:user) { create(:user) }
      let!(:staff) { create(:staff) }
      let!(:exercise1) { create(:exercise, name: 'スクワット', video_url: '/videos/squat.mp4', thumbnail_url: '/thumbnails/squat.jpg') }
      let!(:exercise2) { create(:exercise, name: '片足立ち', video_url: '/videos/single_leg.mp4', thumbnail_url: '/thumbnails/single_leg.jpg') }
      let!(:exercise3) { create(:exercise, name: 'ストレッチ') }

      before do
        post '/api/v1/auth/login', params: {
          email: user.email,
          password: user_password
        }
      end

      context 'with assigned exercises' do
        let!(:patient_exercise1) do
          create(:patient_exercise,
            user: user,
            exercise: exercise1,
            assigned_by_staff: staff,
            target_reps: 10,
            target_sets: 3,
            is_active: true
          )
        end
        let!(:patient_exercise2) do
          create(:patient_exercise,
            user: user,
            exercise: exercise2,
            assigned_by_staff: staff,
            target_reps: 15,
            target_sets: 2,
            is_active: true
          )
        end

        it 'returns assigned exercises' do
          get '/api/v1/users/me/exercises'

          expect(response).to have_http_status(:ok)
          expect(json_response['status']).to eq('success')
          expect(json_response['data']['exercises'].length).to eq(2)
        end

        it 'returns exercise details in correct format' do
          get '/api/v1/users/me/exercises'

          first_exercise = json_response['data']['exercises'].find do |e|
            e['id'] == patient_exercise1.id
          end

          expect(first_exercise).to include(
            'id' => patient_exercise1.id,
            'target_reps' => 10,
            'target_sets' => 3
          )

          expect(first_exercise['exercise']).to include(
            'id' => exercise1.id,
            'name' => 'スクワット',
            'video_url' => '/videos/squat.mp4',
            'thumbnail_url' => '/thumbnails/squat.jpg'
          )
        end

        it 'includes completed_today flag as false when not exercised today' do
          get '/api/v1/users/me/exercises'

          first_exercise = json_response['data']['exercises'].first
          expect(first_exercise['completed_today']).to eq(false)
        end

        context 'when exercise was completed today' do
          before do
            create(:exercise_record,
              user: user,
              exercise: exercise1,
              completed_at: Time.current
            )
          end

          it 'returns completed_today as true for exercised item' do
            get '/api/v1/users/me/exercises'

            completed_exercise = json_response['data']['exercises'].find do |e|
              e['id'] == patient_exercise1.id
            end
            not_completed_exercise = json_response['data']['exercises'].find do |e|
              e['id'] == patient_exercise2.id
            end

            expect(completed_exercise['completed_today']).to eq(true)
            expect(not_completed_exercise['completed_today']).to eq(false)
          end
        end

        context 'when exercise was completed yesterday' do
          before do
            create(:exercise_record,
              user: user,
              exercise: exercise1,
              completed_at: 1.day.ago
            )
          end

          it 'returns completed_today as false' do
            get '/api/v1/users/me/exercises'

            first_exercise = json_response['data']['exercises'].find do |e|
              e['id'] == patient_exercise1.id
            end
            expect(first_exercise['completed_today']).to eq(false)
          end
        end
      end

      context 'with inactive exercises' do
        let!(:active_assignment) do
          create(:patient_exercise,
            user: user,
            exercise: exercise1,
            assigned_by_staff: staff,
            is_active: true
          )
        end
        let!(:inactive_assignment) do
          create(:patient_exercise,
            user: user,
            exercise: exercise2,
            assigned_by_staff: staff,
            is_active: false
          )
        end

        it 'returns only active exercises' do
          get '/api/v1/users/me/exercises'

          expect(response).to have_http_status(:ok)
          expect(json_response['data']['exercises'].length).to eq(1)
          expect(json_response['data']['exercises'].first['id']).to eq(active_assignment.id)
        end
      end

      context 'without assigned exercises' do
        it 'returns empty array' do
          get '/api/v1/users/me/exercises'

          expect(response).to have_http_status(:ok)
          expect(json_response['status']).to eq('success')
          expect(json_response['data']['exercises']).to eq([])
        end
      end

      context 'when other users have exercises' do
        let!(:other_user) { create(:user) }
        let!(:other_user_exercise) do
          create(:patient_exercise,
            user: other_user,
            exercise: exercise1,
            assigned_by_staff: staff,
            is_active: true
          )
        end
        let!(:current_user_exercise) do
          create(:patient_exercise,
            user: user,
            exercise: exercise2,
            assigned_by_staff: staff,
            is_active: true
          )
        end

        it 'returns only current user exercises' do
          get '/api/v1/users/me/exercises'

          expect(json_response['data']['exercises'].length).to eq(1)
          expect(json_response['data']['exercises'].first['id']).to eq(current_user_exercise.id)
        end
      end
    end

    context 'session timeout' do
      let!(:user) { create(:user) }
      let!(:staff) { create(:staff) }
      let!(:exercise) { create(:exercise) }
      let!(:patient_exercise) do
        create(:patient_exercise,
          user: user,
          exercise: exercise,
          assigned_by_staff: staff
        )
      end

      it 'returns unauthorized after 30 minutes of inactivity' do
        post '/api/v1/auth/login', params: {
          email: user.email,
          password: user_password
        }

        Timecop.travel(31.minutes.from_now) do
          get '/api/v1/users/me/exercises'

          expect(response).to have_http_status(:unauthorized)
        end
      end

      it 'allows access within 30 minutes' do
        post '/api/v1/auth/login', params: {
          email: user.email,
          password: user_password
        }

        Timecop.travel(29.minutes.from_now) do
          get '/api/v1/users/me/exercises'

          expect(response).to have_http_status(:ok)
        end
      end
    end
  end
end
