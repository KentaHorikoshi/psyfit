# PsyFit Seed Data
# Run with: rails db:seed
#
# This file creates development data for testing the application.
# The data is idempotent and can be run multiple times.

puts "Seeding database..."

# Clear existing data in development
if Rails.env.development?
  puts "Clearing existing data..."
  ExerciseRecord.delete_all
  DailyCondition.delete_all
  Measurement.delete_all
  PatientExercise.delete_all
  Video.delete_all
  Exercise.delete_all
  AuditLog.delete_all
  User.delete_all
  Staff.delete_all
end

# Create staff members
puts "Creating staff members..."

manager = Staff.find_or_create_by!(staff_id: 'MGR001') do |s|
  s.name = '山田 太郎'
  s.name_kana = 'ヤマダ タロウ'
  s.email = 'yamada@psyfit.example.com'
  s.password = 'Manager1!'
  s.role = 'manager'
end
puts "  Created manager: #{manager.staff_id}"

staff1 = Staff.find_or_create_by!(staff_id: 'STF001') do |s|
  s.name = '佐藤 花子'
  s.name_kana = 'サトウ ハナコ'
  s.email = 'sato@psyfit.example.com'
  s.password = 'Staff123!'
  s.role = 'staff'
end
puts "  Created staff: #{staff1.staff_id}"

staff2 = Staff.find_or_create_by!(staff_id: 'STF002') do |s|
  s.name = '鈴木 一郎'
  s.name_kana = 'スズキ イチロウ'
  s.email = 'suzuki@psyfit.example.com'
  s.password = 'Staff123!'
  s.role = 'staff'
end
puts "  Created staff: #{staff2.staff_id}"

# Create patients (users)
puts "Creating patients..."

patients = []
patient_data = [
  { code: 'USR001', name: '田中 健一', name_kana: 'タナカ ケンイチ', email: 'tanaka@example.com', birth_date: '1960-05-15' },
  { code: 'USR002', name: '高橋 美咲', name_kana: 'タカハシ ミサキ', email: 'takahashi@example.com', birth_date: '1975-08-22' },
  { code: 'USR003', name: '渡辺 大輔', name_kana: 'ワタナベ ダイスケ', email: 'watanabe@example.com', birth_date: '1955-12-03' },
  { code: 'USR004', name: '伊藤 さくら', name_kana: 'イトウ サクラ', email: 'ito@example.com', birth_date: '1968-03-10' },
  { code: 'USR005', name: '小林 雄太', name_kana: 'コバヤシ ユウタ', email: 'kobayashi@example.com', birth_date: '1982-11-28' }
]

patient_data.each do |data|
  patient = User.find_or_create_by!(user_code: data[:code]) do |u|
    u.name = data[:name]
    u.name_kana = data[:name_kana]
    u.email = data[:email]
    u.birth_date = data[:birth_date]
    u.password = 'Patient1!'
  end
  patients << patient
  puts "  Created patient: #{patient.user_code}"
end

# Create exercises
puts "Creating exercises..."

exercises = []
exercise_data = [
  # 筋力トレーニング
  { name: '椅子からの立ち上がり', category: '筋力', difficulty: 'easy', target_body_part: '下肢', recommended_reps: 10, recommended_sets: 3, description: '椅子に座った状態から、手を使わずにゆっくり立ち上がります。膝に負担をかけないよう注意してください。' },
  { name: 'かかと上げ運動', category: '筋力', difficulty: 'easy', target_body_part: 'ふくらはぎ', recommended_reps: 15, recommended_sets: 2, description: '壁に手をついて立ち、かかとを上げ下げします。ふくらはぎの筋力強化に効果的です。' },
  { name: 'スクワット', category: '筋力', difficulty: 'medium', target_body_part: '下肢全体', recommended_reps: 10, recommended_sets: 3, description: '足を肩幅に開き、膝がつま先より前に出ないようにしゃがみます。' },
  { name: 'レッグレイズ', category: '筋力', difficulty: 'medium', target_body_part: '腹筋・股関節', recommended_reps: 10, recommended_sets: 2, description: '仰向けに寝て、足を伸ばしたまま上に持ち上げます。' },

  # バランストレーニング
  { name: '片脚立ち', category: 'バランス', difficulty: 'medium', target_body_part: '体幹・下肢', recommended_reps: 5, recommended_sets: 2, description: '壁や椅子に軽く手を添え、片脚で立ちます。慣れたら手を離して挑戦してください。' },
  { name: 'タンデム歩行', category: 'バランス', difficulty: 'medium', target_body_part: '体幹', recommended_reps: 10, recommended_sets: 2, description: 'かかととつま先をつけながら一直線上を歩きます。' },
  { name: '重心移動', category: 'バランス', difficulty: 'easy', target_body_part: '体幹', recommended_reps: 10, recommended_sets: 2, description: '足を肩幅に開いて立ち、左右に重心を移動させます。' },

  # 柔軟性トレーニング
  { name: 'ハムストリングストレッチ', category: '柔軟性', difficulty: 'easy', target_body_part: '太もも裏', recommended_reps: 3, recommended_sets: 1, description: '椅子に浅く座り、片足を前に伸ばして、ゆっくり前傾します。20秒キープしてください。' },
  { name: '腰のストレッチ', category: '柔軟性', difficulty: 'easy', target_body_part: '腰', recommended_reps: 3, recommended_sets: 1, description: '仰向けに寝て、膝を立てた状態で左右にゆっくり倒します。' },
  { name: 'ふくらはぎストレッチ', category: '柔軟性', difficulty: 'easy', target_body_part: 'ふくらはぎ', recommended_reps: 3, recommended_sets: 1, description: '壁に手をつき、片足を後ろに引いてふくらはぎを伸ばします。' }
]

exercise_data.each do |data|
  exercise = Exercise.find_or_create_by!(name: data[:name]) do |e|
    e.category = data[:category]
    e.difficulty = data[:difficulty]
    e.target_body_part = data[:target_body_part]
    e.recommended_reps = data[:recommended_reps]
    e.recommended_sets = data[:recommended_sets]
    e.description = data[:description]
    e.duration_seconds = rand(60..300)
  end
  exercises << exercise
  puts "  Created exercise: #{exercise.name}"
end

# Create videos for exercises
puts "Creating videos..."

exercises.each_with_index do |exercise, index|
  Video.find_or_create_by!(exercise: exercise, title: "#{exercise.name} - 解説動画") do |v|
    v.video_url = "https://example.com/videos/exercise_#{exercise.id}.mp4"
    v.thumbnail_url = "https://example.com/thumbnails/exercise_#{exercise.id}.jpg"
    v.duration_seconds = rand(60..180)
    v.display_order = 0
    v.is_active = true
    v.description = "#{exercise.name}の正しいやり方を解説します。"
  end
end
puts "  Created #{exercises.count} videos"

# Assign exercises to patients
puts "Assigning exercises to patients..."

patients.each do |patient|
  # Assign 3-5 random exercises to each patient
  assigned_exercises = exercises.sample(rand(3..5))
  assigned_exercises.each do |exercise|
    PatientExercise.find_or_create_by!(user: patient, exercise: exercise) do |pe|
      pe.assigned_by_staff = [staff1, staff2].sample
      pe.target_reps = exercise.recommended_reps
      pe.target_sets = exercise.recommended_sets
      pe.assigned_at = rand(1..30).days.ago
      pe.is_active = true
    end
  end
  puts "  Assigned #{assigned_exercises.count} exercises to #{patient.user_code}"
end

# Create exercise records for patients
puts "Creating exercise records..."

patients.each do |patient|
  patient_exercises = PatientExercise.where(user: patient, is_active: true)

  # Create records for the last 14 days
  14.times do |days_ago|
    next if rand < 0.3 # Skip some days randomly

    date = days_ago.days.ago

    # Complete 1-3 exercises per day
    patient_exercises.sample(rand(1..3)).each do |pe|
      ExerciseRecord.create!(
        user: patient,
        exercise: pe.exercise,
        completed_at: date + rand(0..12).hours,
        completed_reps: pe.target_reps || 10,
        completed_sets: pe.target_sets || 2,
        duration_seconds: rand(120..600),
        notes: rand < 0.2 ? 'とても調子が良かった' : nil
      )
    end
  end
  puts "  Created exercise records for #{patient.user_code}"
end

# Create daily conditions
puts "Creating daily conditions..."

patients.each do |patient|
  14.times do |days_ago|
    next if rand < 0.2 # Skip some days randomly

    date = days_ago.days.ago.to_date

    DailyCondition.find_or_create_by!(user: patient, recorded_date: date) do |dc|
      dc.pain_level = rand(0..7)
      dc.body_condition = rand(4..10)
      dc.notes = rand < 0.3 ? '今日は少し膝が痛む' : nil
    end
  end
  puts "  Created daily conditions for #{patient.user_code}"
end

# Create measurements
puts "Creating measurements..."

patients.each do |patient|
  # Create 2-3 measurements per patient
  rand(2..3).times do |i|
    date = (i * 7).days.ago.to_date

    Measurement.create!(
      user: patient,
      measured_by_staff: [staff1, staff2].sample,
      measured_date: date,
      weight_kg: rand(45.0..90.0).round(1),
      knee_extension_strength_left: rand(10.0..50.0).round(1),
      knee_extension_strength_right: rand(10.0..50.0).round(1),
      tug_seconds: rand(8.0..20.0).round(1),
      single_leg_stance_seconds: rand(5.0..60.0).round(1),
      nrs_pain_score: rand(0..5),
      mmt_score: rand(3..5),
      notes: nil
    )
  end
  puts "  Created measurements for #{patient.user_code}"
end

# Create some audit logs
puts "Creating audit logs..."

5.times do
  AuditLog.log_login_success(patients.sample, ip_address: '192.168.1.100', user_agent: 'Mozilla/5.0')
end
3.times do
  AuditLog.log_login_success([staff1, staff2, manager].sample, ip_address: '192.168.1.101', user_agent: 'Mozilla/5.0')
end
puts "  Created sample audit logs"

puts ""
puts "=" * 50
puts "Seed data created successfully!"
puts "=" * 50
puts ""
puts "Test Accounts:"
puts "-" * 50
puts "Manager: MGR001 / Manager1!"
puts "Staff:   STF001 / Staff123!"
puts "Staff:   STF002 / Staff123!"
puts "Patient: USR001 / Patient1!"
puts "Patient: USR002 / Patient1!"
puts "-" * 50
