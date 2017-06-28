require 'csv'
require 'mongo'

client = Mongo::Client.new('mongodb://localhost:27017/basin')
collection = client[:record]

i = 0
CSV.foreach('./rain_2050_09.csv', headers: true) do |row|
  puts i+=1
  r = row.to_hash.map{|k,v| [k, v.to_f]}
  river_code = r.shift[1]
  collection.update_one({river_code: river_code.to_i}, {'$set': {rainfall: r.to_h}})
end
