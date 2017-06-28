const app = require('express')();
const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/basin', (err, db) => {
  if (err) throw err;

  app.get('/', (req, res) => {
    const query = {$geoIntersects: {$geometry: {
      type: 'Point', coordinates: [parseFloat(req.query.lon), parseFloat(req.query.lat)]
    }}};
    // const query = {$nearSphere: [parseFloat(req.query.lon), parseFloat(req.query.lat)], $maxDistance: 10 / 6378.1};
    db.collection('record').find({loc: query}).toArray((err, result) => {
      if (err) throw err;
      res.header('Access-Control-Allow-Origin', '*');
      res.json(result);
    });
  })

  app.listen(3000, () => console.log('started.'));
})
