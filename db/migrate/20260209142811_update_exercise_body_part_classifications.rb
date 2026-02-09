class UpdateExerciseBodyPartClassifications < ActiveRecord::Migration[8.0]
  def up
    # 運動分類の見直しに伴い、既存データの body_part_major / body_part_minor / exercise_type を更新
    # 名前のみで検索し、全分類フィールドを明示的にセット

    execute <<~SQL
      UPDATE exercises SET body_part_major = '上肢', body_part_minor = '肘・前腕'
      WHERE name = '肘を曲げる運動';
    SQL

    execute <<~SQL
      UPDATE exercises SET body_part_major = '体幹・脊柱', body_part_minor = '胸部・腹部'
      WHERE name = '上肢回旋（ソラシックツイスト）';
    SQL

    execute <<~SQL
      UPDATE exercises SET body_part_major = '体幹・脊柱', body_part_minor = '腰椎・骨盤'
      WHERE name = '下肢回旋（両膝倒しツイスト）';
    SQL

    execute <<~SQL
      UPDATE exercises SET body_part_major = '体幹・脊柱', body_part_minor = '腹部・胸部'
      WHERE name = 'キャットアンドドッグ';
    SQL

    execute <<~SQL
      UPDATE exercises SET body_part_major = '体幹・脊柱', body_part_minor = '腹部・胸部'
      WHERE name = '背中丸め（座位片膝抱えストレッチ）';
    SQL

    execute <<~SQL
      UPDATE exercises SET exercise_type = 'トレーニング'
      WHERE name = '背中丸め（座位片膝抱えストレッチ）';
    SQL

    execute <<~SQL
      UPDATE exercises SET body_part_major = '下肢', body_part_minor = '股関節・大腿'
      WHERE name = 'チェアスクワット';
    SQL

    execute <<~SQL
      UPDATE exercises SET body_part_major = '下肢', body_part_minor = '膝・下腿'
      WHERE name = '膝伸ばし（座位膝伸展運動）';
    SQL

    execute <<~SQL
      UPDATE exercises SET body_part_major = '体幹・脊柱', body_part_minor = '腹部・胸部'
      WHERE name = '膝つきプランク';
    SQL

    execute <<~SQL
      UPDATE exercises SET body_part_major = '体幹・脊柱', body_part_minor = '腹部・胸部'
      WHERE name = 'ロールダウン';
    SQL

    execute <<~SQL
      UPDATE exercises SET body_part_major = '下肢', body_part_minor = '股関節・大腿'
      WHERE name = '殿筋トレーニング(膝屈曲位うつ伏せ股関節伸展運動)';
    SQL

    execute <<~SQL
      UPDATE exercises SET body_part_major = '体幹・脊柱', body_part_minor = '腰椎・骨盤'
      WHERE name = 'バックブリッジ';
    SQL
  end

  def down
    # 全運動の body_part_major / body_part_minor をnullに戻す
    execute <<~SQL
      UPDATE exercises SET body_part_major = NULL, body_part_minor = NULL
      WHERE name IN (
        '肘を曲げる運動',
        '上肢回旋（ソラシックツイスト）',
        '下肢回旋（両膝倒しツイスト）',
        'キャットアンドドッグ',
        '背中丸め（座位片膝抱えストレッチ）',
        'チェアスクワット',
        '膝伸ばし（座位膝伸展運動）',
        '膝つきプランク',
        'ロールダウン',
        '殿筋トレーニング(膝屈曲位うつ伏せ股関節伸展運動)',
        'バックブリッジ'
      );
    SQL

    execute <<~SQL
      UPDATE exercises SET exercise_type = 'ストレッチ'
      WHERE name = '背中丸め（座位片膝抱えストレッチ）';
    SQL
  end
end
