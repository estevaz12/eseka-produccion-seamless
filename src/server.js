const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const fs = require('fs');
const pdf = require('pdf-parse');
const { default: produccion } = require('./utils/queries/produccion');
const { default: serverLog } = require('./utils/serverLog.js');
const { produccionTest } = require('./utils/test-data.js');

// Environment
let isPackaged;
// once main sends a message to server
process.parentPort.once('message', (e) => {
  isPackaged = e.data;
  serverLog(`isPackaged: ${isPackaged}`);
  startServer();
});

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

const startServer = () => {
  if (isPackaged) {
    (async () => {
      try {
        await sql.connect(config.db);
        serverLog('Connected to database');
      } catch (err) {
        serverLog(`[ERROR] Error connecting to database: ${err}`);
      }
    })();
  }

  app.listen(config.port, () => {
    serverLog(`Listening at http://localhost:${config.port}`);
  });

  app.get('/hello', (req, res) => {
    serverLog('/hello HIT');
    res.json({ data: 'Hello from server!' });
  });

  app.get('/produccion', async (req, res) => {
    serverLog('/produccion HIT');
    serverLog(JSON.stringify(req.query));

    if (isPackaged) {
      try {
        const { room, startDate, endDate, articulo, actual } = req.query;
        const result = await sql.query(
          produccion(room, startDate, endDate, articulo, actual)
        );

        res.json(result.recordset);
      } catch (err) {
        serverLog(`[ERROR] SQL Error: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      res.json(produccionTest);
    }
  });

  app.get('/programada/file', async (req, res) => {
    serverLog('/programada/file HIT');
    const { path } = req.query;
    try {
      const dataBuffer = fs.readFileSync(path);
      pdf(dataBuffer).then((data) => {
        res.json(data);
      });
    } catch (err) {
      serverLog(`[ERROR] PDF Error: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });
};
