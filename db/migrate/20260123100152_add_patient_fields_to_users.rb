class AddPatientFieldsToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :status, :string, limit: 20, default: '維持期', null: false
    add_column :users, :condition, :string, limit: 255
    add_column :users, :gender, :string, limit: 10
    add_column :users, :phone, :string, limit: 20

    add_index :users, :status
    add_index :users, :gender
  end
end
