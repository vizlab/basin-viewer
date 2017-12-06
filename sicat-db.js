const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
});

exports.getCell = (cellType, lat, lon) => {
  const query = `
    SELECT *
    FROM m_cell
    WHERE celltype = $1
      AND ST_COVERS(geog, ($2::GEOMETRY)::GEOGRAPHY)
    LIMIT 1;
  `;
  return pool.query(query, [cellType, `POINT(${lon} ${lat})`])
    .then(res => res.rows[0])
    .catch(e => console.error(e.stack));
};

exports.getCells = cellType => {
  const query = `
    SELECT *
    FROM m_cell
    WHERE celltype = $1
  `;
  return pool.query(query, [cellType])
    .then(res => res.rows)
    .catch(e => console.error(e.stack));
};

exports.getExperiments = () => {
  const query = `
    SELECT *
    FROM m_experiment
  `;
  return pool.query(query)
    .then(res => res.rows)
    .catch(e => console.error(e.stack));
};

exports.getSimulation = simulationId => {
  const query = `
    SELECT *
    FROM m_simulation
    WHERE id = $1
  `;
  return pool.query(query, [simulationId])
    .then(res => res.rows[0])
    .catch(e => console.error(e.stack));
};

exports.getSimulations = experimentId => {
  const query = `
    SELECT *
    FROM m_simulation
    WHERE experimentid = $1
    ORDER BY ensembleno
  `;
  return pool.query(query, [experimentId])
    .then(res => res.rows)
    .catch(e => console.error(e.stack));
};

exports.getDatetimes = (startDate, endDate) => {
  const query = `
    SELECT datetime AT TIME ZONE 'UTC' AS datetime
    FROM m_datetime
    WHERE $1::TIMESTAMP <= datetime
      AND datetime < $2::TIMESTAMP
    ORDER BY datetime
  `;
  return pool.query(query, [startDate, endDate])
    .then(res => res.rows)
    .catch(e => console.error(e.stack));
};

exports.getRains = (simulationId, cellId, startDate, endDate) => {
  const query = `
  SELECT sumx
  FROM sd_rain JOIN m_datetime ON sd_rain.datetimeid = m_datetime.id
  WHERE sd_rain.cellid = $1
    AND $2::TIMESTAMP <= m_datetime.datetime
    AND m_datetime.datetime < $3::TIMESTAMP
    AND simulationid = $4
  ORDER BY m_datetime.datetime
  `;
  return pool.query(query, [cellId, startDate, endDate, simulationId])
    .then(res => res.rows)
    .catch(e => console.error(e.stack));
};
