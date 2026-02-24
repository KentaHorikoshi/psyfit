# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Health', type: :request do
  describe 'GET /api/v1/health' do
    context 'when database is healthy' do
      it 'returns 200 with healthy status' do
        get '/api/v1/health'

        expect(response).to have_http_status(:ok)
        expect(json_response['status']).to eq('success')
        expect(json_response['data']['health_status']).to eq('healthy')
        expect(json_response['data']['checks']['database']).to eq('ok')
        expect(json_response['data']['timestamp']).to be_present
        expect(json_response['data']['version']).to be_present
      end
    end

    context 'when database is unavailable' do
      before do
        allow(ActiveRecord::Base.connection).to receive(:execute).and_raise(PG::ConnectionBad)
      end

      it 'returns 503 with degraded status' do
        get '/api/v1/health'

        expect(response).to have_http_status(:service_unavailable)
        expect(json_response['status']).to eq('error')
        expect(json_response['data']['health_status']).to eq('degraded')
        expect(json_response['data']['checks']['database']).to eq('error')
      end
    end
  end
end
