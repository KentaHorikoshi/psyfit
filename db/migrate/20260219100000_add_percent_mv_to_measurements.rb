class AddPercentMvToMeasurements < ActiveRecord::Migration[8.1]
  def change
    add_column :measurements, :percent_mv, :decimal, precision: 5, scale: 2
  end
end
