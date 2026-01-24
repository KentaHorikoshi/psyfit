class AddDepartmentToStaff < ActiveRecord::Migration[8.1]
  def change
    add_column :staff, :department, :string
  end
end
