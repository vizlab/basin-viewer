const express = require('express');
const basicAuth = require('basic-auth-connect');
const app = express();
const path = require('path');
const wkx = require('wkx');
const {
  getCell,
  getCells,
  getExperiments,
  getSimulation,
  getSimulations,
  getDatetimes,
  getRains,
  getEvents
} = require('./sicat-db');

app.all('/', basicAuth((user, pass) => {
  return process.env.USER === user && process.env.PASS === pass;
}));

app.use('/dist', express.static('dist'));

app.get('/', (req, res) => res.sendFile(path.join(`${__dirname}/index.html`)));

app.get('/experiments', async (req, res) => {
  const experiments = await getExperiments();
  res.json(experiments);
});

app.get('/simulations', async (req, res) => {
  const {experimentId} = req.query;
  const simulations = await getSimulations(experimentId);
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

app.get('/rain', async (req, res) => {
  const cellId = req.query.cellId;
  const simulationId = req.query.simulationId;
  const start = new Date(req.query.startDate);
  const end = new Date(req.query.endDate);
  end.setDate(end.getDate() + 1);
  const datetimes = await getDatetimes(start, end);
  const simulation = await getSimulation(simulationId);
  const rains = await getRains(simulationId, cellId, start, end);
  res.json({
    labels: datetimes.map(({datetime}) => datetime.toISOString().substr(0, 10)),
    ensembles: [{name: simulation.name, data: rains.map(({sumx}) => sumx)}],
  });
});

app.get('/rains', async (req, res) => {
  const {lat, lon} = req.query;
  const cellType = 1;
  const simulationIds = req.query.simulationIds.split(',');
  const start = new Date(req.query.startDate);
  const end = new Date(req.query.endDate);
  end.setDate(end.getDate() + 1);
  const cell = await getCell(cellType, lat, lon);
  const datetimes = await getDatetimes(start, end);
  // TODO improve performance
  const ensembles = [];
  for (const simulationId of simulationIds) {
    const simulation = await getSimulation(simulationId);
    const rains = await getRains(simulationId, cell.id, start, end);
    ensembles.push({
      name: simulation.name,
      data: rains.map(({sumx}) => sumx),
    });
  }
  res.json({
    cell,
    labels: datetimes.map(({datetime}) => datetime.toISOString().substr(0, 10)),
    ensembles,
  });
});

app.get('/events', async (req, res) => {
  // WARN: This is INSANELY slow, so we use dummy data for now.
  // This func should be called from '/rains' and be provided at once
  // const events = await getEvents(experimentName, cellId, start, end);
  const events = require('./data/dummy_events.json');
  res.json({events});
});

app.listen(process.env.PORT || 3000, () => console.log('started.'));
