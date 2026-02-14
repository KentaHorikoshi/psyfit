# PsyFit Seed Data
# Run with: rails db:seed
#
# 環境ごとにシードデータを分岐:
#   - 全環境: 運動マスタ（Exercise）+ 動画（Video）
#   - production: 本番職員アカウント（マネージャー4名 + スタッフ10名）
#   - development/test: テスト用職員・患者・ダミー業務データ

puts "Seeding database (#{Rails.env})..."

# ============================================================
# 開発・テスト環境のみ: 既存データクリア
# ============================================================
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

# ============================================================
# 共通データ: 運動マスタ（全環境）
# ============================================================
puts "Creating exercises..."

exercises = []
exercise_data = [
  # ストレッチ
  { name: '肘を曲げる運動', exercise_type: 'ストレッチ', difficulty: 'easy', body_part_major: '上肢', body_part_minor: '肘・前腕', description: '椅子に座り、右肘を曲げていく動作', video_url: '/videos/elbow-flexion.mp4', thumbnail_url: '/thumbnails/elbow-flexion.jpg', duration_seconds: 180, recommended_reps: 10, recommended_sets: 3 },
  { name: '上肢回旋（ソラシックツイスト）', exercise_type: 'ストレッチ', difficulty: 'medium', body_part_major: '体幹・脊柱', body_part_minor: '胸部・腹部', description: '横向きに寝て両手を伸ばした状態から上の手を広げて上半身を捻る。', video_url: '/videos/thoracic-twist.mp4', thumbnail_url: '/thumbnails/thoracic-twist.jpg', duration_seconds: 180, recommended_reps: 10, recommended_sets: 3 },
  { name: '下肢回旋（両膝倒しツイスト）', exercise_type: 'ストレッチ', difficulty: 'medium', body_part_major: '体幹・脊柱', body_part_minor: '腰椎・骨盤', description: '仰向けに寝た状態で両膝を立てて腰を左右に捻る。', video_url: '/videos/knee-drop-twist.mp4', thumbnail_url: '/thumbnails/knee-drop-twist.jpg', duration_seconds: 180, recommended_reps: 10, recommended_sets: 3 },
  { name: 'キャットアンドドッグ', exercise_type: 'ストレッチ', difficulty: 'hard', body_part_major: '体幹・脊柱', body_part_minor: '腹部・胸部', description: '四つ這いで背中を丸めたり伸ばしたりする背骨周りの筋肉のストレッチ', video_url: '/videos/cat-and-dog.mp4', thumbnail_url: '/thumbnails/cat-and-dog.jpg', duration_seconds: 180, recommended_reps: 10, recommended_sets: 3 },
  { name: '背中丸め（座位片膝抱えストレッチ）', exercise_type: 'トレーニング', difficulty: 'easy', body_part_major: '体幹・脊柱', body_part_minor: '腹部・胸部', description: '座った状態から片膝を両手で抱え、体を丸めて肩甲骨周りを伸ばす。', video_url: '/videos/seated-knee-hug-stretch.mp4', thumbnail_url: '/thumbnails/seated-knee-hug-stretch.jpg', duration_seconds: 180, recommended_reps: 10, recommended_sets: 3 },

  # トレーニング
  { name: 'チェアスクワット', exercise_type: 'トレーニング', difficulty: 'easy', body_part_major: '下肢', body_part_minor: '股関節・大腿', description: '椅子に座った状態からスクワットを行う。', video_url: '/videos/chair-squat.mp4', thumbnail_url: '/thumbnails/chair-squat.jpg', duration_seconds: 180, recommended_reps: 10, recommended_sets: 3 },
  { name: '膝伸ばし（座位膝伸展運動）', exercise_type: 'トレーニング', difficulty: 'easy', body_part_major: '下肢', body_part_minor: '膝・下腿', description: '椅子に座った状態で片膝を伸ばす。', video_url: '/videos/seated-knee-extension.mp4', thumbnail_url: '/thumbnails/seated-knee-extension.jpg', duration_seconds: 180, recommended_reps: 10, recommended_sets: 3 },
  { name: 'ロールダウン', exercise_type: 'トレーニング', difficulty: 'medium', body_part_major: '体幹・脊柱', body_part_minor: '腹部・胸部', description: '体育座りの姿勢から体を丸めながら後方に倒し、倒れるぎりぎりのところから元の位置まで起こす。', video_url: '/videos/roll-down.mp4', thumbnail_url: '/thumbnails/roll-down.jpg', duration_seconds: 180, recommended_reps: 10, recommended_sets: 3 },
  { name: '殿筋トレーニング(膝屈曲位うつ伏せ股関節伸展運動)', exercise_type: 'トレーニング', difficulty: 'medium', body_part_major: '下肢', body_part_minor: '股関節・大腿', description: 'うつ伏せの状態で片膝を90°曲げ、曲げた方の足を持ち上げるお尻のトレーンング', video_url: '/videos/prone-hip-extension.mp4', thumbnail_url: '/thumbnails/prone-hip-extension.jpg', duration_seconds: 180, recommended_reps: 10, recommended_sets: 3 },
  { name: '膝つきプランク', exercise_type: 'トレーニング', difficulty: 'hard', body_part_major: '体幹・脊柱', body_part_minor: '腹部・胸部', description: 'うつ伏せで両膝と両肘をついた状態から体を一直線に上げる。', video_url: '/videos/kneeling-plank.mp4', thumbnail_url: '/thumbnails/kneeling-plank.jpg', duration_seconds: 180, recommended_reps: 10, recommended_sets: 3 },
  { name: 'バックブリッジ', exercise_type: 'トレーニング', difficulty: 'hard', body_part_major: '体幹・脊柱', body_part_minor: '腰椎・骨盤', description: '仰向けで両膝を曲げ、お尻を挙げて体を一直線にするように上げる。', video_url: '/videos/back-bridge.mp4', thumbnail_url: '/thumbnails/back-bridge.jpg', duration_seconds: 180, recommended_reps: 10, recommended_sets: 3 }
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

# ============================================================
# 共通データ: 運動動画（全環境）
# ============================================================
puts "Creating videos..."

exercises.each do |exercise|
  Video.find_or_create_by!(exercise: exercise, title: "#{exercise.name} - 解説動画") do |v|
    v.video_url = exercise.video_url
    v.thumbnail_url = exercise.thumbnail_url
    v.duration_seconds = exercise.duration_seconds
    v.display_order = 0
    v.is_active = true
    v.description = "#{exercise.name}の正しいやり方を解説します。"
  end
end
puts "  Created #{exercises.count} videos"

# ============================================================
# 本番環境: 職員アカウント
# ============================================================
if Rails.env.production?
  puts "Creating production staff accounts..."

  # 仮パスワード（初回ログイン後に各自で変更してください）
  temp_password = 'Psyfit2026!'

  production_staff = [
    # マネージャー
    { name: '西野智之', role: 'manager' },
    { name: '稲葉樹生', role: 'manager' },
    { name: '尾崎純', role: 'manager' },
    { name: '黒木怜', role: 'manager' },
    # スタッフ
    { name: '大木宏輔', role: 'staff' },
    { name: '鈴木亮陽', role: 'staff' },
    { name: '田中涼乃', role: 'staff' },
    { name: '藤崎彩矢', role: 'staff' },
    { name: '中西健人', role: 'staff' },
    { name: '山下大輝', role: 'staff' },
    { name: '児島雄貴', role: 'staff' },
    { name: '浅井菜々穂', role: 'staff' },
    { name: '浅沼直樹', role: 'staff' },
    { name: '山口桃佳', role: 'staff' },
    { name: '吉川美希', role: 'staff' }
  ]

  created_staff = []
  production_staff.each do |data|
    # staff_id はモデルの before_validation で自動生成（MGR001〜, STF001〜）
    staff = Staff.find_or_initialize_by(name: data[:name]) do |s|
      s.role = data[:role]
      s.password = temp_password
    end
    if staff.new_record?
      staff.save!
      created_staff << staff
      puts "  Created #{staff.role}: #{staff.staff_id} (#{staff.name})"
    else
      puts "  Already exists: #{staff.staff_id} (#{staff.name})"
    end
  end

  puts ""
  puts "=" * 50
  puts "本番シードデータ作成完了"
  puts "=" * 50
  puts ""
  puts "運動マスタ: #{exercises.count}件"
  puts "職員アカウント: #{created_staff.count}件 新規作成"
  puts ""
  if created_staff.any?
    puts "作成された職員アカウント:"
    puts "-" * 50
    created_staff.each do |s|
      puts "  #{s.role.upcase.ljust(8)} #{s.staff_id} #{s.name}"
    end
    puts "-" * 50
    puts "仮パスワード: #{temp_password}"
    puts "※ 初回ログイン後に各自でパスワードを変更してください"
  end

# ============================================================
# 開発・テスト環境: テストデータ
# ============================================================
else
  # Create staff members
  puts "Creating test staff members..."

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

  # Assign exercises to patients
  puts "Assigning exercises to patients..."

  patients.each do |patient|
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

    14.times do |days_ago|
      next if rand < 0.3

      date = days_ago.days.ago
      record_date = date.beginning_of_day + rand(8..18).hours

      patient_exercises.sample(rand(1..3)).each do |pe|
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
      next if rand < 0.2

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
end
