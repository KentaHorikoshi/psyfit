# PsyFit Seed Data
# Run with: rails db:seed
#
# This file creates development data for testing the application.
# The data is idempotent and can be run multiple times.

puts "Seeding database..."

# Clear existing data in development/test
if Rails.env.development? || Rails.env.test?
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
  # ストレッチ
  { name: '肘を曲げる運動', exercise_type: 'ストレッチ', difficulty: 'easy', body_part_major: '上肢', body_part_minor: '肘・前腕', description: '椅子に座り、右肘を曲げていく動作', video_url: '/videos/0.mp4', thumbnail_url: '/thumbnails/0.jpg', duration_seconds: 180, recommended_reps: 10, recommended_sets: 3 },
  { name: '上肢回旋（ソラシックツイスト）', exercise_type: 'ストレッチ', difficulty: 'medium', body_part_major: '体幹・脊柱', body_part_minor: '胸部・腹部', description: '横向きに寝て両手を伸ばした状態から上の手を広げて上半身を捻る。', video_url: '/videos/1.mp4', thumbnail_url: '/thumbnails/1.jpg', duration_seconds: 180, recommended_reps: 10, recommended_sets: 3 },
  { name: '下肢回旋（両膝倒しツイスト）', exercise_type: 'ストレッチ', difficulty: 'medium', body_part_major: '体幹・脊柱', body_part_minor: '腰椎・骨盤', description: '仰向けに寝た状態で両膝を立てて腰を左右に捻る。', video_url: '/videos/2.mp4', thumbnail_url: '/thumbnails/2.jpg', duration_seconds: 180, recommended_reps: 10, recommended_sets: 3 },
  { name: 'キャットアンドドッグ', exercise_type: 'ストレッチ', difficulty: 'hard', body_part_major: '体幹・脊柱', body_part_minor: '腹部・胸部', description: '四つ這いで背中を丸めたり伸ばしたりする背骨周りの筋肉のストレッチ', video_url: '/videos/10.mp4', thumbnail_url: '/thumbnails/10.jpg', duration_seconds: 180, recommended_reps: 10, recommended_sets: 3 },
  { name: '背中丸め（座位片膝抱えストレッチ）', exercise_type: 'トレーニング', difficulty: 'easy', body_part_major: '体幹・脊柱', body_part_minor: '腹部・胸部', description: '座った状態から片膝を両手で抱え、体を丸めて肩甲骨周りを伸ばす。', video_url: '/videos/8.mp4', thumbnail_url: '/thumbnails/8.jpg', duration_seconds: 180, recommended_reps: 10, recommended_sets: 3 },

  # トレーニング
  { name: 'チェアスクワット', exercise_type: 'トレーニング', difficulty: 'easy', body_part_major: '下肢', body_part_minor: '股関節・大腿', description: '椅子に座った状態からスクワットを行う。', video_url: '/videos/3.mp4', thumbnail_url: '/thumbnails/3.jpg', duration_seconds: 180, recommended_reps: 10, recommended_sets: 3 },
  { name: '膝伸ばし（座位膝伸展運動）', exercise_type: 'トレーニング', difficulty: 'easy', body_part_major: '下肢', body_part_minor: '膝・下腿', description: '椅子に座った状態で片膝を伸ばす。', video_url: '/videos/4.mp4', thumbnail_url: '/thumbnails/4.jpg', duration_seconds: 180, recommended_reps: 10, recommended_sets: 3 },
  { name: 'ロールダウン', exercise_type: 'トレーニング', difficulty: 'medium', body_part_major: '体幹・脊柱', body_part_minor: '腹部・胸部', description: '体育座りの姿勢から体を丸めながら後方に倒し、倒れるぎりぎりのところから元の位置まで起こす。', video_url: '/videos/6.mp4', thumbnail_url: '/thumbnails/6.jpg', duration_seconds: 180, recommended_reps: 10, recommended_sets: 3 },
  { name: '殿筋トレーニング(膝屈曲位うつ伏せ股関節伸展運動)', exercise_type: 'トレーニング', difficulty: 'medium', body_part_major: '下肢', body_part_minor: '股関節・大腿', description: 'うつ伏せの状態で片膝を90°曲げ、曲げた方の足を持ち上げるお尻のトレーンング', video_url: '/videos/9.mp4', thumbnail_url: '/thumbnails/9.jpg', duration_seconds: 180, recommended_reps: 10, recommended_sets: 3 },
  { name: '膝つきプランク', exercise_type: 'トレーニング', difficulty: 'hard', body_part_major: '体幹・脊柱', body_part_minor: '腹部・胸部', description: 'うつ伏せで両膝と両肘をついた状態から体を一直線に上げる。', video_url: '/videos/5.mp4', thumbnail_url: '/thumbnails/5.jpg', duration_seconds: 180, recommended_reps: 10, recommended_sets: 3 },
  { name: 'バックブリッジ', exercise_type: 'トレーニング', difficulty: 'hard', body_part_major: '体幹・脊柱', body_part_minor: '腰椎・骨盤', description: '仰向けで両膝を曲げ、お尻を挙げて体を一直線にするように上げる。', video_url: '/videos/7.mp4', thumbnail_url: '/thumbnails/7.jpg', duration_seconds: 180, recommended_reps: 10, recommended_sets: 3 }
]

exercise_data.each do |data|
  exercise = Exercise.find_or_create_by!(name: data[:name]) do |e|
    e.exercise_type = data[:exercise_type]
    e.difficulty = data[:difficulty]
    e.body_part_major = data[:body_part_major]
    e.body_part_minor = data[:body_part_minor]
    e.description = data[:description]
    e.video_url = data[:video_url]
    e.thumbnail_url = data[:thumbnail_url]
    e.duration_seconds = data[:duration_seconds]
    e.recommended_reps = data[:recommended_reps]
    e.recommended_sets = data[:recommended_sets]
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
      pe.assigned_by_staff = [ staff1, staff2 ].sample
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
    # Use beginning_of_day + fixed hours to avoid future date issues
    record_date = date.beginning_of_day + rand(8..18).hours

    patient_exercises.sample(rand(1..3)).each do |pe|
      # Skip date range validation for seed data (allows historical records beyond yesterday)
      record = ExerciseRecord.new(
        user: patient,
        exercise: pe.exercise,
        completed_at: record_date,
        completed_reps: pe.target_reps || 10,
        completed_sets: pe.target_sets || 2,
        duration_seconds: rand(120..600),
        notes: rand < 0.2 ? 'とても調子が良かった' : nil
      )
      record.save!(validate: false)
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
      measured_by_staff: [ staff1, staff2 ].sample,
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
  AuditLog.log_login_success([ staff1, staff2, manager ].sample, ip_address: '192.168.1.101', user_agent: 'Mozilla/5.0')
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
