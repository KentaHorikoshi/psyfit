# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::DailyConditions', type: :request do
  let(:user) { create(:user) }

  describe 'POST /api/v1/daily_conditions' do
    context 'when user is authenticated' do
      before { sign_in_as_user(user) }

      context 'with valid parameters' do
        let(:valid_params) do
          {
            recorded_date: Date.current.to_s,
            pain_level: 3,
            body_condition: 7,
            notes: '少し痛みがあるが調子は良い'
          }
        end

        it 'creates a new daily condition' do
          expect {
            post '/api/v1/daily_conditions', params: valid_params
          }.to change(DailyCondition, :count).by(1)
        end

        it 'returns created status' do
          post '/api/v1/daily_conditions', params: valid_params

          expect(response).to have_http_status(:created)
        end

        it 'returns the created condition data' do
          post '/api/v1/daily_conditions', params: valid_params

          expect(json_response['status']).to eq('success')
          expect(json_response['data']['recorded_date']).to eq(Date.current.to_s)
          expect(json_response['data']['pain_level']).to eq(3)
          expect(json_response['data']['body_condition']).to eq(7)
        end
      end

      context 'with minimal parameters (no notes)' do
        let(:minimal_params) do
          {
            recorded_date: Date.current.to_s,
            pain_level: 5,
            body_condition: 5
          }
        end

        it 'creates a daily condition without notes' do
          expect {
            post '/api/v1/daily_conditions', params: minimal_params
          }.to change(DailyCondition, :count).by(1)
        end
      end

      context 'when record exists for the same day' do
        before do
          create(:daily_condition, user: user, recorded_date: Date.current, pain_level: 1, body_condition: 1)
        end

        let(:update_params) do
          {
            recorded_date: Date.current.to_s,
            pain_level: 5,
            body_condition: 8
          }
        end

        it 'updates the existing record instead of creating new one' do
          expect {
            post '/api/v1/daily_conditions', params: update_params
          }.not_to change(DailyCondition, :count)
        end

        it 'returns the updated data' do
          post '/api/v1/daily_conditions', params: update_params

          expect(response).to have_http_status(:ok)
          expect(json_response['status']).to eq('success')
          expect(json_response['data']['pain_level']).to eq(5)
          expect(json_response['data']['body_condition']).to eq(8)
        end
      end

      context 'with invalid parameters' do
        it 'returns error when pain_level is missing' do
          post '/api/v1/daily_conditions', params: {
            recorded_date: Date.current.to_s,
            body_condition: 7
          }

          expect(response).to have_http_status(:unprocessable_content)
          expect(json_response['status']).to eq('error')
        end

        it 'returns error when pain_level is out of range' do
          post '/api/v1/daily_conditions', params: {
            recorded_date: Date.current.to_s,
            pain_level: 11,
            body_condition: 7
          }

          expect(response).to have_http_status(:unprocessable_content)
        end

        it 'returns error when body_condition is out of range' do
          post '/api/v1/daily_conditions', params: {
            recorded_date: Date.current.to_s,
            pain_level: 3,
            body_condition: -1
          }

          expect(response).to have_http_status(:unprocessable_content)
        end
      end
    end

    context 'when user is not authenticated' do
      it 'returns unauthorized status' do
        post '/api/v1/daily_conditions', params: {
          recorded_date: Date.current.to_s,
          pain_level: 3,
          body_condition: 7
        }

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET /api/v1/users/me/daily_conditions' do
    context 'when user is authenticated' do
      before { sign_in_as_user(user) }

      context 'with existing records' do
        before do
          create(:daily_condition, user: user, recorded_date: 3.days.ago.to_date, pain_level: 5, body_condition: 5)
          create(:daily_condition, user: user, recorded_date: 2.days.ago.to_date, pain_level: 4, body_condition: 6)
          create(:daily_condition, user: user, recorded_date: 1.day.ago.to_date, pain_level: 3, body_condition: 7)
          create(:daily_condition, user: user, recorded_date: Date.current, pain_level: 2, body_condition: 8)
        end

        it 'returns all conditions in descending order' do
          get '/api/v1/users/me/daily_conditions'

          expect(response).to have_http_status(:ok)
          expect(json_response['status']).to eq('success')

          conditions = json_response['data']['conditions']
          expect(conditions.length).to eq(4)
          expect(conditions.first['recorded_date']).to eq(Date.current.to_s)
        end

        it 'filters by date range when provided' do
          get '/api/v1/users/me/daily_conditions', params: {
            start_date: 2.days.ago.to_date.to_s,
            end_date: Date.current.to_s
          }

          expect(response).to have_http_status(:ok)

          conditions = json_response['data']['conditions']
          expect(conditions.length).to eq(3)
        end
      end

      context 'with no records' do
        it 'returns empty array' do
          get '/api/v1/users/me/daily_conditions'

          expect(response).to have_http_status(:ok)
          expect(json_response['data']['conditions']).to eq([])
        end
      end

      context 'does not return other users records' do
        let(:other_user) { create(:user) }

        before do
          create(:daily_condition, user: user, recorded_date: Date.current, pain_level: 2, body_condition: 8)
          create(:daily_condition, user: other_user, recorded_date: Date.current, pain_level: 5, body_condition: 5)
        end

        it 'only returns current users records' do
          get '/api/v1/users/me/daily_conditions'

          conditions = json_response['data']['conditions']
          expect(conditions.length).to eq(1)
          expect(conditions.first['pain_level']).to eq(2)
        end
      end
    end

    context 'when user is not authenticated' do
      it 'returns unauthorized status' do
        get '/api/v1/users/me/daily_conditions'

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
