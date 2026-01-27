# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Rack::Attack', type: :request do
  # Use a real MemoryStore for Rack::Attack in tests (NullStore discards writes)
  let(:memory_store) { ActiveSupport::Cache::MemoryStore.new }

  before(:each) do
    @original_store = Rack::Attack.cache.store
    Rack::Attack.cache.store = memory_store
    Rack::Attack.reset!
  end

  after(:each) do
    Rack::Attack.cache.store = @original_store
  end

  describe 'Authentication endpoint throttling' do
    describe 'user login (POST /api/v1/auth/login)' do
      it 'allows up to 10 requests per minute' do
        10.times do
          post '/api/v1/auth/login', params: { email: 'test@example.com', password: 'wrong' }
        end

        expect(response).not_to have_http_status(429)
      end

      it 'blocks the 11th request within a minute' do
        11.times do
          post '/api/v1/auth/login', params: { email: 'test@example.com', password: 'wrong' }
        end

        expect(response).to have_http_status(429)
      end

      it 'returns JSON error body when throttled' do
        11.times do
          post '/api/v1/auth/login', params: { email: 'test@example.com', password: 'wrong' }
        end

        body = JSON.parse(response.body)
        expect(body['error']).to eq('Rate limit exceeded')
        expect(body['retry_after']).to be_a(Integer)
      end

      it 'includes Retry-After header when throttled' do
        11.times do
          post '/api/v1/auth/login', params: { email: 'test@example.com', password: 'wrong' }
        end

        expect(response.headers['Retry-After']).to be_present
      end
    end

    describe 'staff login (POST /api/v1/auth/staff/login)' do
      it 'allows up to 10 requests per minute' do
        10.times do
          post '/api/v1/auth/staff/login', params: { staff_id: 'STF001', password: 'wrong' }
        end

        expect(response).not_to have_http_status(429)
      end

      it 'blocks the 11th request within a minute' do
        11.times do
          post '/api/v1/auth/staff/login', params: { staff_id: 'STF001', password: 'wrong' }
        end

        expect(response).to have_http_status(429)
      end
    end
  end

  describe 'Password reset throttling' do
    it 'allows up to 5 requests per hour' do
      5.times do
        post '/api/v1/auth/password_reset_request', params: { email: 'test@example.com' }
      end

      expect(response).not_to have_http_status(429)
    end

    it 'blocks the 6th request within an hour' do
      6.times do
        post '/api/v1/auth/password_reset_request', params: { email: 'test@example.com' }
      end

      expect(response).to have_http_status(429)
    end
  end

  describe 'General API rate limiting' do
    describe 'user endpoints (60 req/min)' do
      let!(:user) { create(:user) }

      before do
        post '/api/v1/auth/login', params: { email: user.email, password: 'Password123!' }
      end

      it 'allows up to 60 requests per minute for user sessions' do
        # login doesn't count toward api/user throttle, so 60 GETs should all pass
        60.times do
          get '/api/v1/auth/me'
        end

        expect(response).not_to have_http_status(429)
      end

      it 'blocks the 61st request for user sessions' do
        # 61 GETs exceeds limit of 60
        61.times do
          get '/api/v1/auth/me'
        end

        expect(response).to have_http_status(429)
      end
    end

    describe 'staff endpoints (120 req/min)' do
      let!(:staff) { create(:staff) }

      before do
        post '/api/v1/auth/staff/login', params: { staff_id: staff.staff_id, password: 'Staff123!' }
      end

      it 'allows up to 120 requests per minute for staff sessions' do
        # login doesn't count toward api/staff throttle, so 120 GETs should all pass
        120.times do
          get '/api/v1/auth/me'
        end

        expect(response).not_to have_http_status(429)
      end

      it 'blocks the 121st request for staff sessions' do
        # 121 GETs exceeds limit of 120
        121.times do
          get '/api/v1/auth/me'
        end

        expect(response).to have_http_status(429)
      end
    end
  end

  describe 'Rate limit response headers' do
    it 'includes X-RateLimit-Limit header' do
      get '/api/v1/health'

      expect(response.headers['X-RateLimit-Limit']).to be_present
    end

    it 'includes X-RateLimit-Remaining header' do
      get '/api/v1/health'

      expect(response.headers['X-RateLimit-Remaining']).to be_present
    end

    it 'includes X-RateLimit-Reset header' do
      get '/api/v1/health'

      expect(response.headers['X-RateLimit-Reset']).to be_present
    end

    it 'decrements X-RateLimit-Remaining on each request' do
      get '/api/v1/health'
      first_remaining = response.headers['X-RateLimit-Remaining'].to_i

      get '/api/v1/health'
      second_remaining = response.headers['X-RateLimit-Remaining'].to_i

      expect(second_remaining).to eq(first_remaining - 1)
    end

    it 'shows correct limit for user sessions' do
      user = create(:user)
      post '/api/v1/auth/login', params: { email: user.email, password: 'Password123!' }

      get '/api/v1/auth/me'

      expect(response.headers['X-RateLimit-Limit']).to eq('60')
    end

    it 'shows correct limit for staff sessions' do
      staff = create(:staff)
      post '/api/v1/auth/staff/login', params: { staff_id: staff.staff_id, password: 'Staff123!' }

      get '/api/v1/auth/me'

      expect(response.headers['X-RateLimit-Limit']).to eq('120')
    end
  end

  describe 'Throttled response format' do
    it 'returns 429 with correct JSON structure' do
      11.times do
        post '/api/v1/auth/login', params: { email: 'test@example.com', password: 'wrong' }
      end

      expect(response).to have_http_status(429)
      expect(response.content_type).to include('application/json')

      body = JSON.parse(response.body)
      expect(body).to have_key('error')
      expect(body).to have_key('retry_after')
    end

    it 'includes Retry-After header in throttled response' do
      11.times do
        post '/api/v1/auth/login', params: { email: 'test@example.com', password: 'wrong' }
      end

      expect(response.headers['Retry-After']).to be_present
      expect(response.headers['Retry-After'].to_i).to be > 0
    end
  end

  describe 'Suspicious request blocking' do
    it 'blocks requests with SQL injection patterns' do
      # Fail2Ban: maxretry: 3, so 4 requests should trigger ban
      4.times do
        get "/api/v1/health?q=UNION SELECT * FROM users"
      end

      expect(response).to have_http_status(403)
    end

    it 'blocks requests with XSS patterns' do
      # Use onclick= which doesn't get URL-encoded in query key position
      4.times do
        get "/api/v1/health?onclick=alert"
      end

      expect(response).to have_http_status(403)
    end
  end

  describe 'Audit logging' do
    it 'logs rate limit exceeded events' do
      expect {
        11.times do
          post '/api/v1/auth/login', params: { email: 'test@example.com', password: 'wrong' }
        end
      }.to change { AuditLog.where(action: 'rate_limit_exceeded').count }.by_at_least(1)
    end
  end
end
