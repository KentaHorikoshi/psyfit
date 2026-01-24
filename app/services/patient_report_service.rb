# frozen_string_literal: true

require "prawn"
require "prawn/table"

class PatientReportService
  FONT_PATH = Rails.root.join("app/assets/fonts").to_s

  def initialize(patient:, start_date:, end_date:, generated_by:)
    @patient = patient
    @start_date = start_date
    @end_date = end_date
    @generated_by = generated_by
  end

  def generate
    Prawn::Document.new(page_size: "A4", margin: 40) do |pdf|
      setup_fonts(pdf)
      render_header(pdf)
      render_patient_info(pdf)
      render_measurement_section(pdf)
      render_exercise_section(pdf)
      render_condition_section(pdf)
      render_footer(pdf)
    end.render
  end

  private

  def setup_fonts(pdf)
    font_file = File.join(FONT_PATH, "NotoSansJP-Regular.otf")
    if File.exist?(font_file)
      pdf.font_families.update(
        "NotoSansJP" => {
          normal: font_file,
          bold: font_file
        }
      )
      pdf.font "NotoSansJP"
    else
      raise Prawn::Errors::IncompatibleStringEncoding,
            "Japanese font not found. Please install NotoSansJP-Regular.otf"
    end
  end

  def render_header(pdf)
    pdf.text "リハビリ運動レポート", size: 24, style: :bold, align: :center
    pdf.move_down 10
    pdf.text "期間: #{@start_date.strftime('%Y年%m月%d日')} - #{@end_date.strftime('%Y年%m月%d日')}",
             size: 12, align: :center
    pdf.move_down 20
    pdf.stroke_horizontal_rule
    pdf.move_down 15
  end

  def render_patient_info(pdf)
    pdf.text "患者情報", size: 16, style: :bold
    pdf.move_down 10

    patient_data = [
      [ "氏名", @patient.name || "-" ],
      [ "氏名（カナ）", @patient.name_kana || "-" ],
      [ "年齢", @patient.age ? "#{@patient.age}歳" : "-" ],
      [ "性別", gender_label(@patient.gender) ],
      [ "病期", @patient.status || "-" ],
      [ "疾患", @patient.condition || "-" ],
      [ "継続日数", "#{@patient.continue_days || 0}日" ]
    ]

    pdf.table(patient_data, width: pdf.bounds.width) do |t|
      t.cells.padding = 8
      t.cells.borders = [ :bottom ]
      t.column(0).width = 120
      t.column(0).font_style = :bold
    end

    pdf.move_down 20
  end

  def render_measurement_section(pdf)
    pdf.text "測定値推移", size: 16, style: :bold
    pdf.move_down 10

    measurements = @patient.measurements
                           .where(measured_date: @start_date..@end_date)
                           .order(measured_date: :asc)

    if measurements.empty?
      pdf.text "該当期間の測定データはありません。", size: 10, color: "666666"
      pdf.move_down 15
      return
    end

    header = [ "日付", "体重(kg)", "TUG(秒)", "片脚立位(秒)", "NRS", "MMT" ]
    rows = measurements.map do |m|
      [
        m.measured_date.strftime("%m/%d"),
        m.weight_kg&.to_s || "-",
        m.tug_seconds&.to_s || "-",
        m.single_leg_stance_seconds&.to_s || "-",
        m.nrs_pain_score&.to_s || "-",
        m.mmt_score&.to_s || "-"
      ]
    end

    pdf.table([ header ] + rows, width: pdf.bounds.width) do |t|
      t.cells.padding = 6
      t.cells.size = 9
      t.row(0).font_style = :bold
      t.row(0).background_color = "EEEEEE"
    end

    pdf.move_down 20
  end

  def render_exercise_section(pdf)
    pdf.text "運動実施状況", size: 16, style: :bold
    pdf.move_down 10

    records = @patient.exercise_records
                      .includes(:exercise)
                      .where(completed_at: @start_date.beginning_of_day..@end_date.end_of_day)
                      .order(completed_at: :asc)

    if records.empty?
      pdf.text "該当期間の運動記録はありません。", size: 10, color: "666666"
      pdf.move_down 15
      return
    end

    # Summary
    total_exercises = records.count
    total_days = records.map { |r| r.completed_at.to_date }.uniq.count
    pdf.text "実施回数: #{total_exercises}回 / 実施日数: #{total_days}日", size: 11
    pdf.move_down 10

    # Daily breakdown
    daily_records = records.group_by { |r| r.completed_at.to_date }
    header = [ "日付", "運動名", "回数", "セット数" ]
    rows = []

    daily_records.each do |date, day_records|
      day_records.each_with_index do |record, index|
        rows << [
          index.zero? ? date.strftime("%m/%d") : "",
          record.exercise&.name || "-",
          record.completed_reps&.to_s || "-",
          record.completed_sets&.to_s || "-"
        ]
      end
    end

    pdf.table([ header ] + rows, width: pdf.bounds.width) do |t|
      t.cells.padding = 6
      t.cells.size = 9
      t.row(0).font_style = :bold
      t.row(0).background_color = "EEEEEE"
    end

    pdf.move_down 20
  end

  def render_condition_section(pdf)
    pdf.text "体調記録", size: 16, style: :bold
    pdf.move_down 10

    conditions = @patient.daily_conditions
                         .where(recorded_date: @start_date..@end_date)
                         .order(recorded_date: :asc)

    if conditions.empty?
      pdf.text "該当期間の体調記録はありません。", size: 10, color: "666666"
      pdf.move_down 15
      return
    end

    header = [ "日付", "痛み(0-10)", "調子(0-10)", "メモ" ]
    rows = conditions.map do |c|
      [
        c.recorded_date.strftime("%m/%d"),
        c.pain_level&.to_s || "-",
        c.body_condition&.to_s || "-",
        truncate_text(c.notes, 30)
      ]
    end

    pdf.table([ header ] + rows, width: pdf.bounds.width) do |t|
      t.cells.padding = 6
      t.cells.size = 9
      t.row(0).font_style = :bold
      t.row(0).background_color = "EEEEEE"
      t.column(3).width = 150
    end

    pdf.move_down 20
  end

  def render_footer(pdf)
    pdf.stroke_horizontal_rule
    pdf.move_down 10

    pdf.text "出力日時: #{Time.current.strftime('%Y年%m月%d日 %H:%M')}", size: 9, color: "666666"
    pdf.text "出力者: #{@generated_by.name}", size: 9, color: "666666"
  end

  def gender_label(gender)
    case gender
    when "male" then "男性"
    when "female" then "女性"
    when "other" then "その他"
    else "-"
    end
  end

  def truncate_text(text, length)
    return "-" if text.blank?

    text.length > length ? "#{text[0, length]}..." : text
  end
end
