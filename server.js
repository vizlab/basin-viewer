const express = require('express');
const app = express();
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const _ = require('lodash');

app.use('/dist', express.static('dist'));

const connections = require('./connections.json');
const rainfall = require('./rainfall.json');

const getAllUpstreamCodes = river_code => {
  let codeList = [river_code];
  while(true) {
    const currentLength = codeList.length;
    codeList = _.uniq(_.flatten(codeList.concat(codeList.map(code => {
      return connections.filter(conn => conn[1].W07_003 === river_code).map(con => con[0].W07_003);
      // return connections.filter(conn => conn[1].W07_003 === code).map(con => con[0].W07_003);
    }))));
    if(currentLength === codeList.length) break;
  }
  return codeList;
};

MongoClient.connect('mongodb://localhost:27017/sicat', (err, db) => {
  if (err) throw err;

  app.get('/', (req, res) => res.sendFile(path.join(`${__dirname}/index.html`)));

  app.get('/basin', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    const query = {geometry: {$geoIntersects: {$geometry: {
      type: 'Point', coordinates: [parseFloat(req.query.lon), parseFloat(req.query.lat)]
    }}}};
    db.collection('basin').find(query).toArray((err, result) => {
      if(result.length === 0 || result[0].properties.W07_003.endsWith('0000')) return res.json([]);
      const cons = getAllUpstreamCodes(result[0].properties.W07_003);
      db.collection('basin').find({'properties.W07_003': {'$in': cons}}).toArray((err, result2) => {
        return res.json({basins: result.concat(result2), rainfall});
      });
    });
  })

  app.listen(process.env.PORT || 8081, () => console.log('started.'));
});
