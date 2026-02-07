class AddWbiToMeasurements < ActiveRecord::Migration[8.1]
  def change
    add_column :measurements, :wbi_left, :decimal, precision: 5, scale: 2
    add_column :measurements, :wbi_right, :decimal, precision: 5, scale: 2
  end
end
