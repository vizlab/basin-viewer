require 'csv'
require 'json'
require 'mongo'

client = Mongo::Client.new('mongodb://localhost:27017/basin')
collection = client[:record]

rainfall = {}
CSV.foreach('./rain_2050_09.csv', headers: true) do |row|
  r = row.to_hash.map{|k,v| [k, v.to_f]}
  river_code = r.shift[1]
  rainfall[river_code.to_i] = r.to_h
end

records = []
JSON.parse(File.read('./japan-basin.geojson'))['features'].each do |f|
  next if f['geometry']['coordinates'].empty?
  att = f['properties']
  records.push({
    mesh_code: att['W07_001'].to_i,
    valley_code: att['W07_002'].to_i,
    river_code: att['W07_003'].to_i,
    valley_name: att['W07_004'],
    river_name: att['W07_005'],
    loc: f['geometry'],
    rainfall: rainfall[att['W07_003'].to_i]
  })
end
collection.insert_many(records)
