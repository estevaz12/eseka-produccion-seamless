// TODO: api docs
// FIXME - fix imports for consistency; change all to CommonJS
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const { default: serverLog } = require('./utils/serverLog.js');
const { produccionTest } = require('./utils/test-data.js');
const { processPDF } = require('./utils/processPDF.js');
const dayjs = require('dayjs');

// Queries
const { default: produccion } = require('./utils/queries/produccion');
const { insertProgramada } = require('./utils/queries/insertProgramada');
const { compareProgramada } = require('./utils/compareProgramada.js');
const { getProgramada } = require('./utils/queries/getProgramada.js');
const { updateProgramada } = require('./utils/queries/updateProgramada.js');
const { getProgramadaTotal } = require('./utils/queries/getProgramadaTotal.js');
const { getProgColor } = require('./utils/queries/getProgColor.js');
const { getMachines } = require('./utils/queries/getMachines.js');
const { calculateNewTargets } = require('./utils/calculateNewTargets.js');
const { insertColorCodes } = require('./utils/queries/insertColorCodes.js');
const { insertDistr } = require('./utils/queries/insertDistr');
const { getArticulo } = require('./utils/queries/getArticulo.js');
const {
  getArticuloColorDistr,
} = require('./utils/queries/getArticuloColorDistr.js');
const {
  getArticuloColorCodes,
} = require('./utils/queries/getArticuloColorCodes.js');
const {
  insertArticuloWithColors,
} = require('./utils/queries/insertArticuloWithColors.js');

// Environment
let isPackaged; //= false;
// once main sends a message to server
process.parentPort.once('message', (e) => {
  isPackaged = e.data;
  serverLog(`isPackaged: ${isPackaged}`);
  startServer();
});

const app = express();
app.use(cors());
app.use(express.json());

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
    serverLog('GET /hello');
    res.json({ data: 'Hello from server!' });
  });

  app.get('/articulo/:articulo', async (req, res) => {
    const { articulo } = req.params;
    serverLog(`GET /articulo/${articulo}`);
    try {
      const result = await sql.query(getArticulo(articulo));
      res.json(result.recordset);
    } catch (err) {
      serverLog(`[ERROR] GET /articulo/${articulo}: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/articulo/:articulo/colorDistr', async (req, res) => {
    const { articulo } = req.params;
    serverLog(`GET /articulo/${articulo}/colorDistr`);
    try {
      const result = await sql.query(getArticuloColorDistr(articulo));
      res.json(result.recordset);
    } catch (err) {
      serverLog(`[ERROR] GET /articulo/${articulo}/colorDistr: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/articulo/:articulo/colorCodes', async (req, res) => {
    const { articulo } = req.params;
    serverLog(`GET /articulo/${articulo}/colorCodes`);
    try {
      const result = await sql.query(getArticuloColorCodes(articulo));
      res.json(result.recordset);
    } catch (err) {
      serverLog(`[ERROR] GET /articulo/${articulo}/colorCodes: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/articulo/insertWithColors', async (req, res) => {
    serverLog('POST /articulo/insertWithColors');
    const data = req.body;

    try {
      const query = insertArticuloWithColors(data);
      serverLog(query);
      await sql.query(query);
    } catch (err) {
      serverLog(`[ERROR] POST /articulo/insertWithColors: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/colorCodes/insert', async (req, res) => {
    serverLog('POST /colorCodes/insert');
    const data = req.body;

    try {
      const query = insertColorCodes(data);
      serverLog(query);
      await sql.query(query);
    } catch (err) {
      serverLog(`[ERROR] POST /colorCodes/insert: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/colorDistr/insert', async (req, res) => {
    serverLog('POST /colorDistr/insert');
    const data = req.body;

    try {
      const query = insertDistr(data);
      serverLog(query);
      await sql.query(query);
    } catch (err) {
      serverLog(`[ERROR] POST /colorDistr/insert: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/produccion', async (req, res) => {
    serverLog('GET /produccion');
    serverLog(JSON.stringify(req.query));

    if (isPackaged) {
      try {
        const { room, startDate, endDate, articulo, actual } = req.query;
        const result = await sql.query(
          produccion(room, startDate, endDate, articulo, actual)
        );

        res.json(result.recordset);
      } catch (err) {
        serverLog(`[ERROR] GET /produccion: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      res.json(produccionTest);
    }
  });

  app.post('/programada/calculateNewTargets', async (req, res) => {
    serverLog('POST /programada/calculateNewTargets');
    const progUpdates = req.body;

    try {
      const machines = await sql.query(getMachines());
      const targets = await calculateNewTargets(
        progUpdates,
        machines.recordset
      );

      res.json(targets);
    } catch (err) {
      serverLog(`[ERROR] POST /programada/calculateNewTargets: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/programada/compare', async (req, res) => {
    serverLog('POST /programada/compare');
    const data = req.body;

    try {
      const currProg = await sql.query(getProgramada(data.startDate));
      const diff = compareProgramada(currProg.recordset, data.new);
      res.json(diff);
      // const result = await sql.query(query);
    } catch (err) {
      serverLog(`[ERROR] POST /programada/compare: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/programada/file', async (req, res) => {
    serverLog('GET /programada/file');
    const { path } = req.query;

    try {
      const data = await processPDF(path);
      res.json(data);
    } catch (err) {
      serverLog(`[ERROR] PDF Error: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/programada/insertAll', async (req, res) => {
    serverLog('POST /programada/insertAll');
    const data = req.body;

    try {
      await sql.query(insertProgramada(data, 'added'));
      serverLog('POST /programada/insertAll - SUCCESS');
    } catch (err) {
      serverLog(`[ERROR] POST /programada/insertAll: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/programada/total/:startDate', async (req, res) => {
    serverLog('GET /programada/total');
    const { startDate } = req.params;

    try {
      const result = await sql.query(getProgramadaTotal(startDate));
      res.json(result.recordset);
    } catch (err) {
      serverLog(`[ERROR] GET /programada/total: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/programada/update', async (req, res) => {
    serverLog('POST /programada/update');
    const data = req.body;

    try {
      const now = dayjs();
      await sql.query(updateProgramada(data, now));
      serverLog('POST /programada/update - SUCCESS');
      // return inserted rows to calculate new targets
      // include deleted articulos to stop machines
      const result = await sql.query(getProgColor(now, true));
      // serverLog(JSON.stringify(result.recordset, null, 2));
      res.json(result.recordset);
    } catch (err) {
      serverLog(`[ERROR] POST /programada/update: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });
};

// startServer();
