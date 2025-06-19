// TODO: api docs
// FIXME - sql injections
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const dayjs = require('dayjs');

// Utils
const serverLog = require('./utils/serverLog.js');
const processPDF = require('./utils/processPDF.js');
const calculateNewTargets = require('./utils/calculateNewTargets.js');
const parseMachines = require('./utils/parseMachines.js');

// Queries
const produccion = require('./utils/queries/produccion');
const insertProgramada = require('./utils/queries/insertProgramada');
const compareProgramada = require('./utils/compareProgramada.js');
const getProgramada = require('./utils/queries/getProgramada.js');
const updateProgramada = require('./utils/queries/updateProgramada.js');
const getProgramadaTotal = require('./utils/queries/getProgramadaTotal.js');
const getProgColor = require('./utils/queries/getProgColor.js');
const getMachines = require('./utils/queries/getMachines.js');
const insertColorCodes = require('./utils/queries/insertColorCodes.js');
const insertDistr = require('./utils/queries/insertDistr');
const getArticulo = require('./utils/queries/getArticulo.js');
const getArticuloColorDistr = require('./utils/queries/getArticuloColorDistr.js');
const getArticuloColorCodes = require('./utils/queries/getArticuloColorCodes.js');
const insertArticuloWithColors = require('./utils/queries/insertArticuloWithColors.js');
const getProgColorTable = require('./utils/queries/getProgColorTable.js');
const updateProgColorDoc = require('./utils/queries/updateProgColorDoc.js');
const getProgActualDate = require('./utils/queries/getProgActualDate.js');
const getProgLoadDates = require('./utils/queries/getProgLoadDates.js');

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
      res.status(204).end();
    } catch (err) {
      serverLog(`[ERROR] POST /articulo/insertWithColors: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/colors', async (req, res) => {
    serverLog('GET /colors');
    try {
      const result = await sql.query(
        `SELECT * FROM SEA_COLORES ORDER BY Color`
      );
      res.json(result.recordset);
    } catch (err) {
      serverLog(`[ERROR] GET /colors: ${err}`);
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
      res.status(204).end();
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
      res.status(204).end();
    } catch (err) {
      serverLog(`[ERROR] POST /colorDistr/insert: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });

  async function getParsedMachines() {
    let machines = await sql.query(getMachines());
    machines = machines.recordset;
    await parseMachines(machines);
    return machines;
  }

  app.get('/machines', async (req, res) => {
    serverLog('GET /machines');
    try {
      const machines = await getParsedMachines();
      res.json(machines);
    } catch (err) {
      serverLog(`[ERROR] GET /machines: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/machines/producing', async (req, res) => {
    serverLog('GET /machines/producing');
    try {
      let machines = await getParsedMachines();
      /* Machine states that count for production
       * 0: RUN
       * 2: STOP BUTTON
       * 3: AUTOMATIC STOP
       * 4: TARGET
       * 5: F1
       * 6: ELECTRÓNICO
       * 7: MECANICO
       * 9: HILADO
       * 13: TURBINA
       */
      machines = machines.filter((m) =>
        [0, 2, 3, 4, 5, 6, 7, 9, 13].includes(m.State)
      );
      res.json(machines);
    } catch (err) {
      serverLog(`[ERROR] GET /machines/producing: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/machines/newColorCodes', async (req, res) => {
    serverLog('GET /machines/newColorCodes');
    try {
      let machines = await getParsedMachines();
      /* Machine states
       * 0: RUN
       * 2: STOP BUTTON
       * 3: AUTOMATIC STOP
       * 4: TARGET
       * 5: F1
       * 6: ELECTRÓNICO
       * 7: MECANICO
       * 9: HILADO
       * 13: TURBINA
       *
       * Machines in other states could have invalid stylecodes
       */
      machines = Array.from(
        new Map(
          machines
            .filter(
              (m) =>
                [0, 2, 3, 4, 5, 6, 7, 9, 13].includes(m.State) &&
                m.StyleCode.colorId === null
            )
            // makes the entries unique by articulo and colorCode
            // 2+ machines can have the same articulo and color
            .map((m) => [`${m.StyleCode.articulo}_${m.StyleCode.color}`, m])
        ).values()
      );
      res.json(machines);
    } catch (err) {
      serverLog(`[ERROR] GET /machines/newColorCodes: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/produccion', async (req, res) => {
    serverLog('GET /produccion');
    serverLog(JSON.stringify(req.query));

    try {
      const { room, startDate, endDate, actual, articulo, talle, colorId } =
        req.query;
      const result = await sql.query(
        produccion(room, startDate, endDate, actual, articulo, talle, colorId)
      );
      res.json(result.recordset);
    } catch (err) {
      serverLog(`[ERROR] GET /produccion: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/programada', async (req, res) => {
    serverLog('GET /programada');
    try {
      const { startDate, endMonth, endYear } = req.query;
      const [progColor, machines] = await Promise.all([
        // get Programada with Color, month production, and docenas by art.
        sql.query(getProgColorTable(startDate, endMonth, endYear)),
        !req.query.endMonth ? getParsedMachines() : null, // get Machines
      ]);

      res.json({
        progColor: progColor.recordset,
        machines: machines,
      });
    } catch (err) {
      serverLog(`[ERROR] GET /programada: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/programada/actualDate', async (req, res) => {
    serverLog('GET /programada/actualDate');
    try {
      const result = await sql.query(getProgActualDate());
      res.json(result.recordset);
    } catch (err) {
      serverLog(`[ERROR] GET /programada/actualDate: ${err}`);
      res.status(500).json({ error: err.message });
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
      await sql.query(insertProgramada(data, 'inserted'));
      serverLog('POST /programada/insertAll - SUCCESS');
      res.status(204).end();
    } catch (err) {
      serverLog(`[ERROR] POST /programada/insertAll: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/programada/loadDates', async (req, res) => {
    serverLog('GET /programada/loadDates');
    try {
      const result = await sql.query(getProgLoadDates());
      res.json(result.recordset);
    } catch (err) {
      serverLog(`[ERROR] GET /programada/loadDates: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/programada/updateDocenas', async (req, res) => {
    serverLog('POST /programada/updateDocenas');
    const data = req.body;

    try {
      await sql.query(updateProgColorDoc(data));
      serverLog('POST /programada/updateDocenas - SUCCESS');
      res.status(204).end();
    } catch (err) {
      serverLog(`[ERROR] POST /programada/updateDocenas: ${err}`);
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
