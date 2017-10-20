require 'json'
require 'mongo'

Mongo::Logger.logger.level = ::Logger::FATAL
DB = Mongo::Client.new('mongodb://127.0.0.1:27017/sicat')[:basin]
DB.drop
docs = JSON.parse(File.read('./data/japan-basin.geojson'))['features'].delete_if{|f| f['geometry']['coordinates'].empty?}
DB.insert_many(docs)
DB.indexes.create_one('geometry' => '2dsphere')
