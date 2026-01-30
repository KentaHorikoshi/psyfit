# frozen_string_literal: true

require "csv"

class PatientReportCsvService
  UTF8_BOM = "\xEF\xBB\xBF"

  def initialize(patient:, start_date:, end_date:, generated_by:)
    @patient = patient
    @start_date = start_date
    @end_date = end_date
    @generated_by = generated_by
  end

  def generate
    csv_content = CSV.generate do |csv|
      render_header(csv)
      csv << []
      render_patient_info(csv)
      csv << []
      render_measurement_section(csv)
      csv << []
      render_exercise_section(csv)
      csv << []
      render_condition_section(csv)
      csv << []
      render_footer(csv)
    end

    UTF8_BOM + csv_content
  end

  private

  def render_header(csv)
    csv << ["リハビリ運動レポート"]
    csv << ["期間", "#{@start_date.strftime('%Y年%m月%d日')} - #{@end_date.strftime('%Y年%m月%d日')}"]
  end

  def render_patient_info(csv)
    csv << ["[患者情報]"]
    csv << ["氏名", @patient.name || "-"]
    csv << ["氏名（カナ）", @patient.name_kana || "-"]
    csv << ["年齢", @patient.age ? "#{@patient.age}歳" : "-"]
    csv << ["性別", gender_label(@patient.gender)]
    csv << ["病期", @patient.status || "-"]
    csv << ["疾患", @patient.condition || "-"]
    csv << ["継続日数", "#{@patient.continue_days || 0}日"]
  end

  def render_measurement_section(csv)
    csv << ["[測定値推移]"]

    measurements = @patient.measurements
                           .where(measured_date: @start_date..@end_date)
                           .order(measured_date: :asc)

    if measurements.empty?
      csv << ["該当期間の測定データはありません。"]
      return
    end

    csv << ["日付", "体重(kg)", "TUG(秒)", "片脚立位(秒)", "NRS", "MMT"]
    measurements.each do |m|
      csv << [
        m.measured_date.strftime("%Y/%m/%d"),
        m.weight_kg&.to_s || "-",
        m.tug_seconds&.to_s || "-",
        m.single_leg_stance_seconds&.to_s || "-",
        m.nrs_pain_score&.to_s || "-",
        m.mmt_score&.to_s || "-"
      ]
    end
  end

  def render_exercise_section(csv)
    csv << ["[運動実施状況]"]

    records = @patient.exercise_records
                      .includes(:exercise)
                      .where(completed_at: @start_date.beginning_of_day..@end_date.end_of_day)
                      .order(completed_at: :asc)

    if records.empty?
      csv << ["該当期間の運動記録はありません。"]
      return
    end

    total_exercises = records.count
    total_days = records.map { |r| r.completed_at.to_date }.uniq.count
    csv << ["実施回数", "#{total_exercises}回"]
    csv << ["実施日数", "#{total_days}日"]
    csv << []

    csv << ["日付", "運動名", "回数", "セット数"]
    records.each do |record|
      csv << [
        record.completed_at.strftime("%Y/%m/%d"),
        record.exercise&.name || "-",
        record.completed_reps&.to_s || "-",
        record.completed_sets&.to_s || "-"
      ]
    end
  end

  def render_condition_section(csv)
    csv << ["[体調記録]"]

    conditions = @patient.daily_conditions
                         .where(recorded_date: @start_date..@end_date)
                         .order(recorded_date: :asc)

    if conditions.empty?
      csv << ["該当期間の体調記録はありません。"]
      return
    end

    csv << ["日付", "痛み(0-10)", "調子(0-10)", "メモ"]
    conditions.each do |c|
      csv << [
        c.recorded_date.strftime("%Y/%m/%d"),
        c.pain_level&.to_s || "-",
        c.body_condition&.to_s || "-",
        c.notes || "-"
      ]
    end
  end

  def render_footer(csv)
    csv << ["出力日時", Time.current.strftime("%Y年%m月%d日 %H:%M")]
    csv << ["出力者", @generated_by.name]
  end

  def gender_label(gender)
    case gender
    when "male" then "男性"
    when "female" then "女性"
    when "other" then "その他"
    else "-"
    end
  end
end
