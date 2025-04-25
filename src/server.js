const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const { default: produccion } = require('./utils/queries/produccion');
const { default: serverLog } = require('./utils/serverLog');

const app = express();
app.use(cors());

const config = {
  port: 3001,
  db: {
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: false,
      trustServerCertificate: false,
    },
  },
};

(async () => {
  try {
    await sql.connect(config.db);
    serverLog('Connected to database');
  } catch (err) {
    serverLog(`[ERROR] Error connecting to database: ${err}`);
  }
})();

app.listen(config.port, () => {
  serverLog(`Listening at http://localhost:${config.port}`);
});

app.get('/hello', (req, res) => {
  serverLog('/hello HIT');
  res.json({ data: 'Hello from server!' });
});

app.get('/produccion', async (req, res) => {
  serverLog('/produccion HIT');
  try {
    const result = await sql.query(`SELECT TOP 1 * FROM PRODUCTIONS_MONITOR`);
    res.json(result.recordset);
  } catch (err) {
    serverLog(`[ERROR] SQL Error: ${err}`);
    res.status(500).json({ error: err.message });
  }
});
