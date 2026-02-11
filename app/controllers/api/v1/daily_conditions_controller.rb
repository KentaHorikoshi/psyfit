# frozen_string_literal: true

# DailyConditions API Controller
# Handles daily body condition and pain level recording for patients
module Api
  module V1
    class DailyConditionsController < BaseController
      before_action :authenticate_user!

      # POST /api/v1/daily_conditions
      # Creates or updates a daily condition record
      # If a record for the same day exists, updates it instead of creating new one
      def create
        @condition = find_or_initialize_condition
        was_new_record = @condition.new_record?

        if @condition.update(condition_params)
          render_success(
            condition_response(@condition),
            status: was_new_record ? :created : :ok
          )
        else
          render_error(
            "バリデーションエラー",
            errors: @condition.errors.to_hash,
            status: :unprocessable_content
          )
        end
      end

      # GET /api/v1/users/me/daily_conditions
      # Returns the current user's daily condition history
      def index
        @conditions = current_user.daily_conditions.recent

        if date_filter_params?
          @conditions = @conditions.between_dates(
            params[:start_date].to_date,
            params[:end_date].to_date
          )
        end

        render_success({
          conditions: @conditions.map { |c| condition_response(c) }
        })
      end

      private

      def condition_params
        params.permit(:recorded_date, :pain_level, :body_condition, :notes)
      end

      def find_or_initialize_condition
        recorded_date = params[:recorded_date]&.to_date || Date.current

        current_user.daily_conditions.find_or_initialize_by(
          recorded_date: recorded_date
        )
      end

      def date_filter_params?
        params[:start_date].present? && params[:end_date].present?
      end

      def condition_response(condition)
        {
          id: condition.id,
          recorded_date: condition.recorded_date.to_s,
          pain_level: condition.pain_level,
          body_condition: condition.body_condition,
          notes: condition.notes
        }
      end
    end
  end
end
