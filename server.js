const express = require('express');
const app = express();
const path = require('path');
const MongoClient = require('mongodb').MongoClient;

app.use('/dist', express.static('dist'));

MongoClient.connect('mongodb://localhost:27017/basin', (err, db) => {
  if (err) throw err;

  app.get('/', (req, res) => res.sendFile(path.join(`${__dirname}/index.html`)));

  app.get('/basin', (req, res) => {
    const query = {$geoIntersects: {$geometry: {
      type: 'Point', coordinates: [parseFloat(req.query.lon), parseFloat(req.query.lat)]
    }}};
    db.collection('record').find({loc: query}).toArray((err, result) => {
      if (err) throw err;
      res.header('Access-Control-Allow-Origin', '*');
      res.json(result);
    });
  })

  app.listen(process.env.PORT || 8081, () => console.log('started.'));
});
