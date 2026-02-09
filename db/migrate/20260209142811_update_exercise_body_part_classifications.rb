class UpdateExerciseBodyPartClassifications < ActiveRecord::Migration[8.0]
  def up
    # 運動分類の見直しに伴い、既存データの body_part_minor / body_part_major / exercise_type を更新

    # 体幹・脊柱 の中分類変更
    execute <<~SQL
      UPDATE exercises SET body_part_minor = '胸部・腹部'
      WHERE name = '上肢回旋（ソラシックツイスト）' AND body_part_minor = '胸部';
    SQL

    execute <<~SQL
      UPDATE exercises SET body_part_minor = '腰椎・骨盤'
      WHERE name = '下肢回旋（両膝倒しツイスト）' AND body_part_minor = '腰椎';
    SQL

    execute <<~SQL
      UPDATE exercises SET body_part_minor = '腹部・胸部'
      WHERE name = 'キャットアンドドッグ' AND body_part_minor = '腰椎';
    SQL

    execute <<~SQL
      UPDATE exercises SET body_part_minor = '腹部・胸部'
      WHERE name = '膝つきプランク' AND body_part_minor = '腹部';
    SQL

    execute <<~SQL
      UPDATE exercises SET body_part_minor = '腹部・胸部'
      WHERE name = 'ロールダウン' AND body_part_minor = '腹部';
    SQL

    # 背中丸め: 中分類変更 + exercise_type をストレッチからトレーニングに変更
    execute <<~SQL
      UPDATE exercises SET body_part_minor = '腹部・胸部', exercise_type = 'トレーニング'
      WHERE name = '背中丸め（座位片膝抱えストレッチ）' AND body_part_minor = '胸部';
    SQL

    # チェアスクワット: 中分類変更（大分類は下肢のまま）
    execute <<~SQL
      UPDATE exercises SET body_part_minor = '股関節・大腿'
      WHERE name = 'チェアスクワット' AND body_part_minor = '膝・下腿';
    SQL

    # バックブリッジ: 大分類・中分類の両方を変更
    execute <<~SQL
      UPDATE exercises SET body_part_major = '体幹・脊柱', body_part_minor = '腰椎・骨盤'
      WHERE name = 'バックブリッジ' AND body_part_major = '下肢' AND body_part_minor = '股関節・大腿';
    SQL
  end

  def down
    execute <<~SQL
      UPDATE exercises SET body_part_minor = '胸部'
      WHERE name = '上肢回旋（ソラシックツイスト）' AND body_part_minor = '胸部・腹部';
    SQL

    execute <<~SQL
      UPDATE exercises SET body_part_minor = '腰椎'
      WHERE name = '下肢回旋（両膝倒しツイスト）' AND body_part_minor = '腰椎・骨盤';
    SQL

    execute <<~SQL
      UPDATE exercises SET body_part_minor = '腰椎'
      WHERE name = 'キャットアンドドッグ' AND body_part_minor = '腹部・胸部';
    SQL

    execute <<~SQL
      UPDATE exercises SET body_part_minor = '腹部'
      WHERE name = '膝つきプランク' AND body_part_minor = '腹部・胸部';
    SQL

    execute <<~SQL
      UPDATE exercises SET body_part_minor = '腹部'
      WHERE name = 'ロールダウン' AND body_part_minor = '腹部・胸部';
    SQL

    execute <<~SQL
      UPDATE exercises SET body_part_minor = '胸部', exercise_type = 'ストレッチ'
      WHERE name = '背中丸め（座位片膝抱えストレッチ）' AND body_part_minor = '腹部・胸部';
    SQL

    execute <<~SQL
      UPDATE exercises SET body_part_minor = '膝・下腿'
      WHERE name = 'チェアスクワット' AND body_part_minor = '股関節・大腿';
    SQL

    execute <<~SQL
      UPDATE exercises SET body_part_major = '下肢', body_part_minor = '股関節・大腿'
      WHERE name = 'バックブリッジ' AND body_part_major = '体幹・脊柱' AND body_part_minor = '腰椎・骨盤';
    SQL
  end
end
