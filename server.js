const express = require('express');
const app = express();
const path = require('path');
const wkx = require('wkx');
const {
  getCell,
  getCells,
  getExperiments,
  getSimulations,
  getDatetimes,
  getRains
} = require('./sicat-db');

app.use('/dist', express.static('dist'));

app.get('/', (req, res) => res.sendFile(path.join(`${__dirname}/index.html`)));

app.get('/experiments', async (req, res) => {
  const experiments = await getExperiments();
  res.json(experiments);
});

app.get('/simulations', async (req, res) => {
  const simulationId = 2;
  const simulations = await getSimulations(simulationId);
  res.json(simulations);
});

app.get('/cells', async (req, res) => {
  const cellType = 1;
  const cells = await getCells(cellType);
  res.json(cells.map(({id, geog}) => {
    const buffer = new Buffer(geog, 'hex');
    return {
      id,
      geometry: wkx.Geometry.parse(buffer).toGeoJSON()
    };
  }));
});

app.get('/rains', async (req, res) => {
  const {lat, lon} = req.query;
  const cellType = 1;
  const simulationId = 2;
  const start = '2010-09-01 00:00:00';
  const stop = '2010-10-01 00:00:00';
  const cell = await getCell(cellType, lat, lon);
  const simulations = await getSimulations(simulationId);
  const datetimes = await getDatetimes(start, stop);
  const rains = await getRains(cell.id, start, stop);
  const indices = new Map(datetimes.map(({id}, index) => [id, index]));
  const data = new Map(simulations.map(({id}) => [id, new Array(datetimes.length)]));
  for (const {simulationid, datetimeid, sumx} of rains) {
    data.get(simulationid)[indices.get(datetimeid)] = sumx;
  }
  res.json({
    cell,
    labels: datetimes.map(({datetime}) => datetime),
    ensembles: simulations.map(({id, name}) => {
      return {
        name,
        data: data.get(id),
      };
    })
  });
});

app.listen(process.env.PORT || 3000, () => console.log('started.'));
