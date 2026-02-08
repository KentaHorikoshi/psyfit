class AddVisitDatesToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :next_visit_date, :date
    add_column :users, :previous_visit_date, :date
  end
end
