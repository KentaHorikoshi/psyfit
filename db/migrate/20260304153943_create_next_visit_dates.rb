class CreateNextVisitDates < ActiveRecord::Migration[8.1]
  def change
    create_table :next_visit_dates, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.date :visit_date, null: false

      t.timestamps
    end

    add_index :next_visit_dates, %i[user_id visit_date], unique: true
  end
end
