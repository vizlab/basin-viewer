const express = require('express');
const app = express();
const path = require('path');



app.use('/dist', express.static('dist'));

app.get('/', (req, res) => res.sendFile(path.join(`${__dirname}/index.html`)));

app.get('/experiments', async (req, res) => {
  res.json(require('./data/experiments.json'));
});

app.get('/simulations', async (req, res) => {
  res.json(require('./data/simulations.json'));
});

app.get('/cells', async (req, res) => {
  res.json(require('./data/cells.json'));
});

app.get('/rains', async (req, res) => {
  res.json(require('./data/rains.json'));
});

app.listen(process.env.PORT || 3000, () => console.log('started.'));
