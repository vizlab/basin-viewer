const { Pool } = require('pg');
const {
  currentDate,
  nextDate,
  currentMonth,
  nextMonth
} = require('./date');

const pool = new Pool();

exports.getCell = cellId => {
  const query = `
    SELECT *
    FROM m_cell
    WHERE id = $1
  `;
  return pool.query(query, [cellId])
    .then(res => res.rows[0])
    .catch(e => console.error(e.stack));
};

exports.getCells = (cellType, limit) => {
  const query = `
    SELECT *
    FROM m_cell
    WHERE celltype = $1
    LIMIT $2
  `;
  return pool.query(query, [cellType, limit])
    .then(res => res.rows)
    .catch(e => console.error(e.stack));
};

exports.getCellsWithTotalRain = (cellType, limit) => {
  const query = `
    SELECT *
    FROM (SELECT * FROM m_cell WHERE celltype = $1 LIMIT $2) AS m_cell
      LEFT JOIN (
        SELECT
          cellid,
          SUM(cntx) AS cntx,
          MIN(minx) AS minx,
          MAX(maxx) AS maxx,
          SUM(sumx) AS sumx
        FROM sd_train
        GROUP BY cellid
      ) AS sd_train ON m_cell.id = sd_train.cellid
  `;
  return pool.query(query, [cellType, limit])
    .then(res => res.rows)
    .catch(e => console.error(e.stack));
};

exports.getCellByCoordinates = (cellType, lat, lon) => {
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


exports.getExperiment = experimentId => {
  const query = `
    SELECT *
    FROM m_experiment
    WHERE id = $1
  `;
  return pool.query(query, [experimentId])
    .then(res => res.rows[0])
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
    ORDER BY modelname, ensembleno
  `;
  return pool.query(query, [experimentId])
    .then(res => res.rows)
    .catch(e => console.error(e.stack));
};

exports.getDatetimes = (startDate, endDate) => {
  const start = currentDate(startDate);
  const end = nextDate(endDate);
  const query = `
    SELECT datetime AT TIME ZONE 'UTC' AS datetime
    FROM m_datetime
    WHERE $1::TIMESTAMP <= datetime
      AND datetime < $2::TIMESTAMP
    ORDER BY datetime
  `;
  return pool.query(query, [start, end])
    .then(res => res.rows)
    .catch(e => console.error(e.stack));
};

exports.getDate = d => {
  const query = `
    SELECT id, start_date AS datetime
    FROM m_date
    WHERE start_date = $1
  `;
  return pool.query(query, [d])
    .then(res => res.rows[0])
    .catch(e => console.error(e.stack));
};

exports.getDates = (startDate, endDate) => {
  const start = currentDate(startDate);
  const end = nextDate(endDate);
  const query = `
    SELECT start_date AS datetime
    FROM m_date
    WHERE $1 <= start_date
      AND start_date < $2
    ORDER BY start_date
  `;
  return pool.query(query, [start, end])
    .then(res => res.rows)
    .catch(e => console.error(e.stack));
};

exports.getYearMonths = (startDate, endDate) => {
  const start = currentMonth(startDate);
  const end = nextMonth(endDate);
  const query = `
    SELECT start_date AS datetime
    FROM m_yearmonth
    WHERE $1 <= start_date
      AND start_date < $2
    ORDER BY start_date
  `;
  return pool.query(query, [start, end])
    .then(res => res.rows)
    .catch(e => console.error(e.stack));
};

exports.getYears = (startDate, endDate) => {
  const start = new Date(`${startDate.getUTCFullYear()}-01-01T00:00:00.000Z`);
  const end = new Date(`${endDate.getUTCFullYear() + 1}-01-01T00:00:00.000Z`);
  const query = `
    SELECT start_date AS datetime
    FROM m_year
    WHERE $1 <= start_date
      AND start_date < $2
    ORDER BY start_date
  `;
  return pool.query(query, [start, end])
    .then(res => res.rows)
    .catch(e => console.error(e.stack));
};

exports.getRains = (simulationId, cellId, startDate, endDate) => {
  const start = currentDate(startDate);
  const end = nextDate(endDate);
  const query = `
  SELECT cntx, minx, maxx, sumx
  FROM sd_rain JOIN m_datetime ON sd_rain.datetimeid = m_datetime.id
  WHERE sd_rain.cellid = $1
    AND $2::TIMESTAMP <= m_datetime.datetime
    AND m_datetime.datetime < $3::TIMESTAMP
    AND simulationid = $4
  ORDER BY m_datetime.datetime
  `;
  return pool.query(query, [cellId, start, end, simulationId])
    .then(res => res.rows)
    .catch(e => console.error(e.stack));
};

exports.getDailyRains = (simulationId, cellId, startDate, endDate) => {
  const start = currentDate(startDate);
  const end = nextDate(endDate);
  const query = `
  SELECT cntx, minx, maxx, sumx
  FROM sd_drain JOIN m_date ON sd_drain.dateid = m_date.id
  WHERE sd_drain.cellid = $1
    AND $2 <= m_date.start_date
    AND m_date.start_date < $3
    AND simulationid = $4
  ORDER BY m_date.start_date
  `;
  return pool.query(query, [cellId, start, end, simulationId])
    .then(res => res.rows)
    .catch(e => console.error(e.stack));
};

exports.getMonthlyRains = (simulationId, cellId, startDate, endDate) => {
  const start = currentMonth(startDate);
  const end = nextMonth(endDate);
  const query = `
  SELECT cntx, minx, maxx, sumx
  FROM sd_mrain JOIN m_yearmonth ON sd_mrain.yearmonthid = m_yearmonth.id
  WHERE sd_mrain.cellid = $1
    AND $2 <= m_yearmonth.start_date
    AND m_yearmonth.start_date < $3
    AND simulationid = $4
  ORDER BY m_yearmonth.start_date
  `;
  return pool.query(query, [cellId, start, end, simulationId])
    .then(res => res.rows)
    .catch(e => console.error(e.stack));
};

exports.getYearlyRains = (simulationIds, cellId, startDate, endDate) => {
  const start = new Date(`${startDate.getUTCFullYear()}-01-01T00:00:00.000Z`);
  const end = new Date(`${endDate.getUTCFullYear() + 1}-01-01T00:00:00.000Z`);
  const placeHolder = simulationIds.map((_, i) => `$${i + 4}`).join(',');
  const query = `
  SELECT cntx, minx, maxx, sumx, simulationid, m_simulation.name AS simulationname
  FROM sd_yrain
    JOIN m_simulation ON sd_yrain.simulationid = m_simulation.id
    JOIN m_year ON sd_yrain.yearid = m_year.id
  WHERE sd_yrain.cellid = $1
    AND $2 <= m_year.start_date
    AND m_year.start_date < $3
    AND simulationid IN (${placeHolder})
  ORDER BY simulationid, m_year.start_date
  `;
  return pool.query(query, [cellId, start, end, ...simulationIds])
    .then(res => res.rows)
    .catch(e => console.error(e.stack));
};

exports.getEvents = (simulationIds, cellId, startDateId, endDateId, days) => {
  const placeHolder = simulationIds.map((_, i) => `$${i + 5}`).join(',');
  const query = `
  SELECT
    start_date,
    simulationid AS simulation_id,
    name AS simulation_name,
    total AS three_day_rain
  FROM (
      SELECT dateid, simulationid, name, (SUM(sumx / cntx * 24) OVER (PARTITION BY simulationid ORDER BY dateid ROWS BETWEEN 0 PRECEDING AND $4 FOLLOWING)) AS total
      FROM (SELECT * FROM sd_drain WHERE cellid = $1 AND dateid BETWEEN $2 AND $3) AS sd_drain
        JOIN m_simulation ON sd_drain.simulationid = m_simulation.id AND simulationid IN (${placeHolder})
      ORDER BY total DESC
      LIMIT 10
    ) AS ret
    JOIN m_date ON ret.dateid = m_date.id;
  `;
  return pool.query(query, [cellId, startDateId, endDateId, days - 1, ...simulationIds])
    .then(res => res.rows)
    .catch(e => console.error(e.stack));
};
