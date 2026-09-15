# frozen_string_literal: true

Rails.application.routes.draw do
  # ActiveAdmin 3.2.1 — platform ops console
  devise_for :admin_users, class_name: "User", skip: [:registrations],
             path: "admin",
             path_names: { sign_in: "login", sign_out: "logout" },
             controllers: { sessions: "admin/sessions" }
  ActiveAdmin.routes(self)

  get "/health", to: "health#show"
  get "/ready", to: "health#ready"

  namespace :api do
    namespace :v1 do
      # Auth (stubs — wire to Devise JWT)
      post "auth/sign_up", to: "auth#sign_up"
      post "auth/sign_in", to: "auth#sign_in"
      post "auth/refresh", to: "auth#refresh"
      post "auth/sign_out", to: "auth#sign_out"
      post "auth/verify_email", to: "auth#verify_email"
      post "auth/resend_verification", to: "auth#resend_verification"
      post "auth/password/forgot", to: "auth#password_reset_request"
      post "auth/password/reset", to: "auth#password_reset"
      get "me", to: "auth#me"

      resources :notifications, only: %i[index] do
        member do
          post :read, to: "notifications#mark_as_read"
        end
        collection do
          post "read-all", to: "notifications#mark_as_read", defaults: { id: "all" }
        end
      end

      resources :organizations, only: %i[index create show update] do
        resources :members, only: %i[index update destroy], controller: "memberships"
        resources :invitations, only: %i[create], controller: "invitations"
      end

      namespace :marketplace do
        resources :operators, only: %i[index show], param: :slug
        get "profiles/:slug", to: "marketplace/profiles#show"
        post "profiles/:slug/quote_requests", to: "marketplace/quote_requests#create"
        resources :services, only: %i[index show]
        resources :data_products, only: %i[index show]
        get "coverage", to: "coverage#index"
        post "search", to: "search#create"
      end

      namespace :operator do
        resource :profile, only: %i[show update]
        namespace :fleet do
          resources :drones, only: %i[index create update destroy]
          resources :payloads, only: %i[index create update destroy]
        end
        resources :drones
        resources :payloads
        resources :pilots
        resources :services
        resources :data_products
        resources :coverage_areas
        get "jobs", to: "jobs#index"
        get "missions", to: "missions#index"
        get "missions/:id", to: "missions#show"
        get "proposals", to: "proposals#index"
        get "payments", to: "payments#index"
        get "activation", to: "activation#show"
        get "entitlements", to: "entitlements#show"
        patch "profile/premium", to: "profile_premium#update"
        resources :materials, only: %i[index create update destroy]
        resources :quote_requests, only: %i[index], controller: "quote_requests"
        get "analytics", to: "analytics#show"
        resource :connect, only: %i[show create], controller: "connect"
      end

      resources :projects do
        member do
          post :archive
        end
      end

      resources :missions do
        member do
          post :publish
          post :cancel
          get :timeline
          get :matches
        end
        resources :quotes, only: %i[index create]
        resource :geometry, only: %i[create update], controller: "mission_geometry"
        resources :products, only: %i[create destroy], controller: "mission_products"
        resources :assignments, only: %i[create], controller: "mission_assignments"
        post "start", to: "mission_actions#start"
        post "finish-capture", to: "mission_actions#finish_capture"
        resources :deliverables, only: %i[index]
        post "deliverables/upload-sessions", to: "deliverables#upload_session"
        post "deliverables/finalize", to: "deliverables#finalize"
        post "review", to: "reviews#create"
        get "quote-comparison", to: "quotes#comparison"
      end

      resources :quotes, only: %i[show update] do
        member do
          post :submit
          post :accept
          post :reject
          post :withdraw
        end
      end

      resources :orders, only: %i[index show] do
        member do
          post :cancel
          post :complete
          post :confirm_payment, to: "payments#confirm"
          post :checkout, to: "orders/checkouts#create"
        end
        resources :payments, only: %i[index]
      end

      resources :deliverables, only: %i[show] do
        member do
          post :finalize
          post :submit_review
          post :approve
          post :reject
          get :download_url
          get :preview
        end
      end

      get "data-library", to: "data_library#index"

      namespace :billing do
        get "stripe_config", to: "stripe_config#show"
        get "plan", to: "subscriptions#show"
        get "usage", to: "usage#show"
        post "checkout", to: "checkout#create"
        post "portal", to: "portal#create"
        resources :invoices, only: %i[index]
      end

      resources :webhooks, only: %i[index create update destroy] do
        member do
          post :rotate_secret
        end
      end

      namespace :content do
        resources :posts, only: %i[index show], param: :slug
      end

      post "webhooks/stripe", to: "webhooks/stripe#create"

      namespace :ads do
        get "banners", to: "banners#index"
        post "banners/:id/track", to: "banners#track"
      end


      namespace :admin do
        resources :plans, only: %i[index update]
        get "feature_definitions", to: "entitlements#index"
        post "organizations/:organization_id/entitlements", to: "entitlements#create"
        resources :badges, only: %i[index] do
          collection do
            post :grant
          end
          member do
            post :revoke
          end
        end
        resources :posts do
          member do
            post :publish
          end
        end
        resources :banners do
          collection do
            get :placements
          end
        end
        resources :categories
        resources :operators, only: %i[index show] do
          member do
            post :verify
            post :reject
          end
        end
        resources :verifications, only: %i[index]
        resources :missions, only: %i[index show]
        resources :orders, only: %i[index show]
        resources :disputes, only: %i[index show update]
        resources :reviews, only: %i[index update]
        get "risk", to: "risk#index"
        get "analytics", to: "analytics#show"
      end
    end
  end
end

