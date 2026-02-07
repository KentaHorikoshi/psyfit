# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::ExerciseMasters', type: :request do
  let(:manager) { create(:staff, :manager) }
  let(:staff_member) { create(:staff) }
  let(:patient) { create(:user) }

  let!(:squat) do
    create(:exercise,
      name: 'スクワット',
      description: '膝の筋力を強化する運動',
      exercise_type: 'トレーニング',
      difficulty: 'medium',
      body_part_major: '下肢',
      body_part_minor: '膝・下腿',
      recommended_reps: 10,
      recommended_sets: 3,
      video_url: '/videos/squat.mp4',
      thumbnail_url: '/thumbnails/squat.jpg',
      duration_seconds: 120
    )
  end

  let!(:balance_exercise) do
    create(:exercise,
      name: '片足立ち',
      description: 'バランス能力を向上させる運動',
      exercise_type: 'バランス',
      difficulty: 'easy',
      body_part_major: '下肢',
      body_part_minor: '足関節・足部',
      recommended_reps: 5,
      recommended_sets: 2,
      duration_seconds: 60
    )
  end

  let!(:stretch) do
    create(:exercise,
      name: 'ハムストリングストレッチ',
      description: '柔軟性を高める運動',
      exercise_type: 'ストレッチ',
      difficulty: 'easy',
      body_part_major: '下肢',
      body_part_minor: '股関節・大腿',
      recommended_reps: nil,
      recommended_sets: nil,
      duration_seconds: 180
    )
  end

  let!(:hard_training) do
    create(:exercise,
      name: 'ランジ',
      description: '高負荷のトレーニング',
      exercise_type: 'トレーニング',
      difficulty: 'hard',
      body_part_major: '下肢',
      body_part_minor: '股関節・大腿',
      recommended_reps: 8,
      recommended_sets: 4,
      duration_seconds: 240
    )
  end

  describe 'GET /api/v1/exercise_masters' do
    context 'when staff is authenticated' do
      before { staff_login(manager) }

      it 'returns all exercises' do
        get '/api/v1/exercise_masters'

        expect(response).to have_http_status(:ok)
        expect(json_response['status']).to eq('success')
        expect(json_response['data']['exercises'].length).to eq(4)
      end

      it 'returns exercises with required fields' do
        get '/api/v1/exercise_masters'

        exercise = json_response['data']['exercises'].find { |e| e['name'] == 'スクワット' }
        expect(exercise).to include(
          'id' => squat.id,
          'name' => 'スクワット',
          'description' => '膝の筋力を強化する運動',
          'exercise_type' => 'トレーニング',
          'difficulty' => 'medium',
          'body_part_major' => '下肢',
          'body_part_minor' => '膝・下腿',
          'recommended_reps' => 10,
          'recommended_sets' => 3,
          'video_url' => '/videos/squat.mp4',
          'thumbnail_url' => '/thumbnails/squat.jpg',
          'duration_seconds' => 120
        )
      end

      context 'exercise_type filter' do
        it 'filters by exercise_type トレーニング' do
          get '/api/v1/exercise_masters', params: { exercise_type: 'トレーニング' }

          expect(response).to have_http_status(:ok)
          exercises = json_response['data']['exercises']
          expect(exercises.length).to eq(2)
          expect(exercises.map { |e| e['exercise_type'] }).to all(eq('トレーニング'))
        end

        it 'filters by exercise_type バランス' do
          get '/api/v1/exercise_masters', params: { exercise_type: 'バランス' }

          exercises = json_response['data']['exercises']
          expect(exercises.length).to eq(1)
          expect(exercises.first['name']).to eq('片足立ち')
        end

        it 'filters by exercise_type ストレッチ' do
          get '/api/v1/exercise_masters', params: { exercise_type: 'ストレッチ' }

          exercises = json_response['data']['exercises']
          expect(exercises.length).to eq(1)
          expect(exercises.first['name']).to eq('ハムストリングストレッチ')
        end
      end

      context 'body_part_major filter' do
        it 'filters by body_part_major 下肢' do
          get '/api/v1/exercise_masters', params: { body_part_major: '下肢' }

          exercises = json_response['data']['exercises']
          expect(exercises.length).to eq(4)
          expect(exercises.map { |e| e['body_part_major'] }).to all(eq('下肢'))
        end
      end

      context 'body_part_minor filter' do
        it 'filters by body_part_minor 膝・下腿' do
          get '/api/v1/exercise_masters', params: { body_part_minor: '膝・下腿' }

          exercises = json_response['data']['exercises']
          expect(exercises.length).to eq(1)
          expect(exercises.first['name']).to eq('スクワット')
        end
      end

      context 'difficulty filter' do
        it 'filters by difficulty easy' do
          get '/api/v1/exercise_masters', params: { difficulty: 'easy' }

          exercises = json_response['data']['exercises']
          expect(exercises.length).to eq(2)
          expect(exercises.map { |e| e['difficulty'] }).to all(eq('easy'))
        end

        it 'filters by difficulty medium' do
          get '/api/v1/exercise_masters', params: { difficulty: 'medium' }

          exercises = json_response['data']['exercises']
          expect(exercises.length).to eq(1)
          expect(exercises.first['name']).to eq('スクワット')
        end

        it 'filters by difficulty hard' do
          get '/api/v1/exercise_masters', params: { difficulty: 'hard' }

          exercises = json_response['data']['exercises']
          expect(exercises.length).to eq(1)
          expect(exercises.first['name']).to eq('ランジ')
        end
      end

      context 'combined filters' do
        it 'filters by exercise_type and difficulty' do
          get '/api/v1/exercise_masters', params: { exercise_type: 'トレーニング', difficulty: 'medium' }

          exercises = json_response['data']['exercises']
          expect(exercises.length).to eq(1)
          expect(exercises.first['name']).to eq('スクワット')
        end

        it 'returns empty when no match for combined filters' do
          get '/api/v1/exercise_masters', params: { exercise_type: 'バランス', difficulty: 'hard' }

          exercises = json_response['data']['exercises']
          expect(exercises).to be_empty
        end
      end

      context 'when no exercises exist' do
        before { Exercise.destroy_all }

        it 'returns empty array' do
          get '/api/v1/exercise_masters'

          expect(response).to have_http_status(:ok)
          expect(json_response['data']['exercises']).to eq([])
        end
      end

      it 'creates audit log entry' do
        expect {
          get '/api/v1/exercise_masters'
        }.to change(AuditLog, :count).by(1)

        audit = AuditLog.order(:created_at).last
        expect(audit.action).to eq('read')
        expect(audit.status).to eq('success')
        expect(audit.staff_id).to eq(manager.id)
        info = JSON.parse(audit.additional_info)
        expect(info['resource_type']).to eq('Exercise')
      end
    end

    context 'as regular staff' do
      before { staff_login(staff_member) }

      it 'returns exercises successfully' do
        get '/api/v1/exercise_masters'

        expect(response).to have_http_status(:ok)
        expect(json_response['data']['exercises'].length).to eq(4)
      end
    end

    context 'when user (patient) is authenticated' do
      before { sign_in_as_user(patient) }

      it 'returns unauthorized' do
        get '/api/v1/exercise_masters'

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized' do
        get '/api/v1/exercise_masters'

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when session is expired' do
      before do
        staff_login(manager)
        Timecop.travel(16.minutes.from_now)
      end

      it 'returns unauthorized' do
        get '/api/v1/exercise_masters'

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  private

  def staff_login(staff)
    post '/api/v1/auth/staff/login', params: {
      staff_id: staff.staff_id,
      password: 'Staff123!'
    }
  end
end
