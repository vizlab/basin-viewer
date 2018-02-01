const express = require('express');
const basicAuth = require('basic-auth-connect');
const app = express();
const path = require('path');
const wkx = require('wkx');
const {
  getCell,
  getCellsWithTotalRain,
  getCellByCoordinates,
  getExperiment,
  getExperiments,
  getSimulation,
  getSimulations,
  getDatetimes,
  getDate,
  getDates,
  getYearMonths,
  getYears,
  getRains,
  getDailyRains,
  getMonthlyRains,
  getYearlyRains,
  getEvents
} = require('./sicat-db');
const {ensureUTC} = require('./date');

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
  const {cellType, limit} = req.query;
  const cells = await getCellsWithTotalRain(cellType, limit);
  res.json(cells.map(({id, geog, cntx, minx, maxx, sumx}) => {
    const buffer = new Buffer(geog, 'hex');
    return {
      id,
      avg: sumx / cntx,
      max: maxx,
      min: minx,
      geometry: wkx.Geometry.parse(buffer).toGeoJSON()
    };
  }));
});

app.get('/rains', async (req, res) => {
  const measureFunctions = {
    avg: d => d.sumx / d.cntx,
    min: d => d.minx,
    max: d => d.maxx
  };
  const datetimeFunctions = {
    hour: getDatetimes,
    day: getDates,
    month: getYearMonths,
    year: getYears
  };
  const rainFunctions = {
    hour: getRains,
    day: getDailyRains,
    month: getMonthlyRains,
    year: getYearlyRains
  };

  const {lat, lon, range, measure, cellType} = req.query;
  const simulationIds = req.query.simulationIds.split(',');
  const start = ensureUTC(new Date(req.query.startDate));
  const end = ensureUTC(new Date(req.query.endDate));
  const measureFunction = measureFunctions[measure] || measureFunctions.avg;
  const datetimeFunction = datetimeFunctions[range] || datetimeFunctions.year;
  const rainFunction = rainFunctions[range] || rainFunctions.year;

  const cell = await getCellByCoordinates(cellType, lat, lon);
  const datetimes = await datetimeFunction(start, end);
  // TODO improve performance
  const ensembles = [];
  for (const simulationId of simulationIds) {
    const simulation = await getSimulation(simulationId);
    const rains = await rainFunction(simulationId, cell.id, start, end);
    ensembles.push({
      name: simulation.name,
      data: rains.map(measureFunction),
    });
  }
  res.json({
    cell,
    labels: datetimes.map(({datetime}) => datetime.toISOString()),
    ensembles,
  });
});

app.get('/events', async (req, res) => {
  const {experimentId, cellId} = req.query;
  const start = await getDate(ensureUTC(new Date(req.query.startDate)));
  const end = await getDate(ensureUTC(new Date(req.query.endDate)));
  const events = await getEvents(experimentId, cellId, start.id, end.id, 3);
  res.json({events});
});

app.listen(process.env.PORT || 3000, () => console.log('started.'));
