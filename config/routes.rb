Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # API v1 routes
  namespace :api do
    namespace :v1 do
      # Health check for connection testing
      get 'health', to: 'health#show'

      # Authentication
      scope :auth do
        post 'login', to: 'auth#login'
        post 'staff/login', to: 'auth#staff_login'
        delete 'logout', to: 'auth#logout'
        get 'me', to: 'auth#me'
      end

      # User endpoints (current user)
      scope :users do
        get 'me/exercises', to: 'user_exercises#index'
        get 'me/exercise_records', to: 'exercise_records#index'
        get 'me/daily_conditions', to: 'daily_conditions#index'
        get 'me/measurements', to: 'user_measurements#index'
      end

      # Exercise Records
      resources :exercise_records, only: [:create]

      # Daily Conditions
      resources :daily_conditions, only: [:create]

      # Staff endpoints (patients management)
      resources :patients, only: [:index, :show] do
        resources :measurements, only: [:index, :create], controller: 'measurements'
        resources :exercises, only: [:create], controller: 'patient_exercises'
        get 'report', to: 'patient_reports#show'
      end

      # Staff management (manager only)
      resources :staff, only: [:index, :create]
    end
  end

  # Defines the root path route ("/")
  # root "posts#index"
end
