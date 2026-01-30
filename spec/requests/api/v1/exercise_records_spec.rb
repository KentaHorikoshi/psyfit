# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::ExerciseRecords', type: :request do
  let(:user_password) { 'Password123!' }

  describe 'POST /api/v1/exercise_records' do
    context 'when not authenticated' do
      it 'returns unauthorized error' do
        post '/api/v1/exercise_records', params: {
          exercise_id: SecureRandom.uuid,
          completed_reps: 10,
          completed_sets: 3
        }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response['status']).to eq('error')
        expect(json_response['message']).to include('認証')
      end
    end

    context 'when authenticated as user' do
      let!(:user) { create(:user, continue_days: 0, last_exercise_at: nil) }
      let!(:staff) { create(:staff) }
      let!(:exercise) { create(:exercise, name: 'スクワット') }
      let!(:patient_exercise) do
        create(:patient_exercise,
          user: user,
          exercise: exercise,
          assigned_by_staff: staff,
          target_reps: 10,
          target_sets: 3
        )
      end

      before do
        post '/api/v1/auth/login', params: {
          email: user.email,
          password: user_password
        }
      end

      context 'with valid parameters' do
        let(:valid_params) do
          {
            exercise_id: exercise.id,
            completed_reps: 10,
            completed_sets: 3,
            duration_seconds: 180
          }
        end

        it 'creates an exercise record' do
          expect {
            post '/api/v1/exercise_records', params: valid_params
          }.to change(ExerciseRecord, :count).by(1)
        end

        it 'returns success with created record' do
          post '/api/v1/exercise_records', params: valid_params

          expect(response).to have_http_status(:created)
          expect(json_response['status']).to eq('success')
          expect(json_response['data']).to include(
            'exercise_id' => exercise.id,
            'completed_reps' => 10,
            'completed_sets' => 3
          )
          expect(json_response['data']['id']).to be_present
          expect(json_response['data']['completed_at']).to be_present
        end

        it 'associates the record with the current user' do
          post '/api/v1/exercise_records', params: valid_params

          record = ExerciseRecord.last
          expect(record.user_id).to eq(user.id)
        end

        context 'with custom completed_at' do
          let(:custom_time) { '2026-01-21T10:30:00+09:00' }
          let(:params_with_time) { valid_params.merge(completed_at: custom_time) }

          it 'uses the provided completed_at time' do
            post '/api/v1/exercise_records', params: params_with_time

            expect(json_response['data']['completed_at']).to include('2026-01-21')
          end
        end

        it 'records action in audit log' do
          expect {
            post '/api/v1/exercise_records', params: valid_params
          }.to change(AuditLog, :count).by(1)

          log = AuditLog.recent.first
          expect(log.action).to eq('create')
          expect(log.status).to eq('success')
          expect(log.user_id).to eq(user.id)
        end
      end

      context 'with invalid parameters' do
        context 'when exercise_id is missing' do
          it 'returns validation error' do
            post '/api/v1/exercise_records', params: {
              completed_reps: 10,
              completed_sets: 3
            }

            expect(response).to have_http_status(:unprocessable_entity)
            expect(json_response['status']).to eq('error')
          end
        end

        context 'when exercise_id is invalid' do
          it 'returns not found error' do
            post '/api/v1/exercise_records', params: {
              exercise_id: SecureRandom.uuid,
              completed_reps: 10,
              completed_sets: 3
            }

            expect(response).to have_http_status(:not_found)
          end
        end

        context 'when completed_reps is negative' do
          it 'returns validation error' do
            post '/api/v1/exercise_records', params: {
              exercise_id: exercise.id,
              completed_reps: -1,
              completed_sets: 3
            }

            expect(response).to have_http_status(:unprocessable_entity)
          end
        end

        context 'when completed_sets is zero' do
          it 'returns validation error' do
            post '/api/v1/exercise_records', params: {
              exercise_id: exercise.id,
              completed_reps: 10,
              completed_sets: 0
            }

            expect(response).to have_http_status(:unprocessable_entity)
          end
        end
      end

      context 'continue_days update' do
        context 'when first exercise ever' do
          it 'sets continue_days to 1' do
            post '/api/v1/exercise_records', params: {
              exercise_id: exercise.id,
              completed_reps: 10,
              completed_sets: 3
            }

            expect(user.reload.continue_days).to eq(1)
          end

          it 'sets last_exercise_at to current time' do
            freeze_time = Time.current
            Timecop.freeze(freeze_time) do
              post '/api/v1/exercise_records', params: {
                exercise_id: exercise.id,
                completed_reps: 10,
                completed_sets: 3
              }

              expect(user.reload.last_exercise_at).to be_within(1.second).of(freeze_time)
            end
          end
        end

        context 'when exercised yesterday' do
          before do
            user.update!(continue_days: 5, last_exercise_at: 1.day.ago.beginning_of_day)
          end

          it 'increments continue_days' do
            post '/api/v1/exercise_records', params: {
              exercise_id: exercise.id,
              completed_reps: 10,
              completed_sets: 3
            }

            expect(user.reload.continue_days).to eq(6)
          end
        end

        context 'when already exercised today' do
          before do
            user.update!(continue_days: 5, last_exercise_at: Time.current.beginning_of_day)
          end

          it 'does not increment continue_days' do
            post '/api/v1/exercise_records', params: {
              exercise_id: exercise.id,
              completed_reps: 10,
              completed_sets: 3
            }

            expect(user.reload.continue_days).to eq(5)
          end
        end

        context 'when gap is more than 1 day' do
          before do
            user.update!(continue_days: 10, last_exercise_at: 3.days.ago)
          end

          it 'resets continue_days to 1' do
            post '/api/v1/exercise_records', params: {
              exercise_id: exercise.id,
              completed_reps: 10,
              completed_sets: 3
            }

            expect(user.reload.continue_days).to eq(1)
          end
        end
      end
    end

    context 'session timeout' do
      let!(:user) { create(:user) }
      let!(:exercise) { create(:exercise) }

      it 'returns unauthorized after 30 minutes of inactivity' do
        post '/api/v1/auth/login', params: {
          email: user.email,
          password: user_password
        }

        Timecop.travel(31.minutes.from_now) do
          post '/api/v1/exercise_records', params: {
            exercise_id: exercise.id,
            completed_reps: 10,
            completed_sets: 3
          }

          expect(response).to have_http_status(:unauthorized)
        end
      end
    end
  end

  describe 'GET /api/v1/users/me/exercise_records' do
    context 'when not authenticated' do
      it 'returns unauthorized error' do
        get '/api/v1/users/me/exercise_records'

        expect(response).to have_http_status(:unauthorized)
        expect(json_response['status']).to eq('error')
      end
    end

    context 'when authenticated as user' do
      let!(:user) { create(:user, continue_days: 14) }
      let!(:staff) { create(:staff) }
      let!(:exercise1) { create(:exercise, name: 'スクワット') }
      let!(:exercise2) { create(:exercise, name: '片足立ち') }

      before do
        post '/api/v1/auth/login', params: {
          email: user.email,
          password: user_password
        }
      end

      context 'with exercise records' do
        let!(:record1) do
          create(:exercise_record,
            user: user,
            exercise: exercise1,
            completed_reps: 10,
            completed_sets: 3,
            completed_at: 1.day.ago
          )
        end
        let!(:record2) do
          create(:exercise_record,
            user: user,
            exercise: exercise2,
            completed_reps: 15,
            completed_sets: 2,
            completed_at: Time.current
          )
        end

        it 'returns exercise records' do
          get '/api/v1/users/me/exercise_records'

          expect(response).to have_http_status(:ok)
          expect(json_response['status']).to eq('success')
          expect(json_response['data']['records'].length).to eq(2)
        end

        it 'returns records in descending order by completed_at' do
          get '/api/v1/users/me/exercise_records'

          records = json_response['data']['records']
          expect(records.first['id']).to eq(record2.id)
          expect(records.last['id']).to eq(record1.id)
        end

        it 'includes exercise details in flat format' do
          get '/api/v1/users/me/exercise_records'

          first_record = json_response['data']['records'].first
          expect(first_record).to include(
            'exercise_id' => exercise2.id,
            'exercise_name' => '片足立ち',
            'exercise_category' => exercise2.category,
            'sets_completed' => 2,
            'reps_completed' => 15
          )
          expect(first_record).not_to have_key('exercise')
          expect(first_record).not_to have_key('completed_reps')
          expect(first_record).not_to have_key('completed_sets')
        end

        it 'includes summary with total_exercises and continue_days' do
          get '/api/v1/users/me/exercise_records'

          summary = json_response['data']['summary']
          expect(summary['total_exercises']).to eq(2)
          expect(summary['continue_days']).to eq(14)
        end

        it 'calculates total_minutes from duration_seconds' do
          # Update records with duration
          record1.update!(duration_seconds: 300)  # 5 minutes
          record2.update!(duration_seconds: 420)  # 7 minutes

          get '/api/v1/users/me/exercise_records'

          summary = json_response['data']['summary']
          expect(summary['total_minutes']).to eq(12)  # 300 + 420 = 720 seconds = 12 minutes
        end
      end

      context 'with date filtering' do
        let!(:old_record) do
          create(:exercise_record,
            user: user,
            exercise: exercise1,
            completed_at: 2.months.ago
          )
        end
        let!(:recent_record) do
          create(:exercise_record,
            user: user,
            exercise: exercise2,
            completed_at: 1.week.ago
          )
        end

        it 'filters by start_date' do
          get '/api/v1/users/me/exercise_records', params: {
            start_date: 1.month.ago.to_date.to_s
          }

          expect(json_response['data']['records'].length).to eq(1)
          expect(json_response['data']['records'].first['id']).to eq(recent_record.id)
        end

        it 'filters by end_date' do
          get '/api/v1/users/me/exercise_records', params: {
            end_date: 1.month.ago.to_date.to_s
          }

          expect(json_response['data']['records'].length).to eq(1)
          expect(json_response['data']['records'].first['id']).to eq(old_record.id)
        end

        it 'filters by date range' do
          get '/api/v1/users/me/exercise_records', params: {
            start_date: 2.weeks.ago.to_date.to_s,
            end_date: Date.current.to_s
          }

          expect(json_response['data']['records'].length).to eq(1)
          expect(json_response['data']['records'].first['id']).to eq(recent_record.id)
        end
      end

      context 'without exercise records' do
        it 'returns empty array' do
          get '/api/v1/users/me/exercise_records'

          expect(response).to have_http_status(:ok)
          expect(json_response['data']['records']).to eq([])
        end

        it 'returns summary with zeros' do
          get '/api/v1/users/me/exercise_records'

          summary = json_response['data']['summary']
          expect(summary['total_exercises']).to eq(0)
          expect(summary['total_minutes']).to eq(0)
        end
      end

      context 'when other users have records' do
        let!(:other_user) { create(:user) }
        let!(:other_record) do
          create(:exercise_record,
            user: other_user,
            exercise: exercise1,
            completed_at: Time.current
          )
        end
        let!(:current_user_record) do
          create(:exercise_record,
            user: user,
            exercise: exercise2,
            completed_at: Time.current
          )
        end

        it 'returns only current user records' do
          get '/api/v1/users/me/exercise_records'

          expect(json_response['data']['records'].length).to eq(1)
          expect(json_response['data']['records'].first['id']).to eq(current_user_record.id)
        end
      end
    end

    context 'session timeout' do
      let!(:user) { create(:user) }

      it 'returns unauthorized after 30 minutes of inactivity' do
        post '/api/v1/auth/login', params: {
          email: user.email,
          password: user_password
        }

        Timecop.travel(31.minutes.from_now) do
          get '/api/v1/users/me/exercise_records'

          expect(response).to have_http_status(:unauthorized)
        end
      end
    end
  end
end
