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

// test data
const actualDateTestData = require('./utils/test-data/actualDateTestData.js');
const articuloTestData = require('./utils/test-data/articuloTestData.js');
const articuloColorDistrTestData = require('./utils/test-data/articuloColorDistrTestData.js');
const articuloColorCodesTestData = require('./utils/test-data/articuloColorCodesTestData.js');
const calculateNewTargetsTestData = require('./utils/test-data/calculateNewTargetsTestData.js');
const colorsTestData = require('./utils/test-data/colorsTestData.js');
const compareTestData = require('./utils/test-data/compareTestData.js');
const loadDatesTestData = require('./utils/test-data/loadDatesTestData.js');
const newColorCodesTestData = require('./utils/test-data/newColorCodesTestData.js');
const previousRecordTestData = require('./utils/test-data/previousRecordTestData.js');
const produccionTestData = require('./utils/test-data/produccionTestData.js');
const producingTestData = require('./utils/test-data/producingTestData.js');
const programadaTestData = require('./utils/test-data/programadaTestData.js');
const programadaAnteriorTestData = require('./utils/test-data/programadaAnteriorTestData.js');
const programadaTotalTestData = require('./utils/test-data/programadaTotalTestData.js');
const insertProgStartDate = require('./utils/queries/insertProgStartDate.js');

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

    if (isPackaged) {
      try {
        const result = await sql.query(getArticulo(articulo));
        res.json(result.recordset);
      } catch (err) {
        serverLog(`[ERROR] GET /articulo/${articulo}: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /articulo/:articulo');
      res.json(articuloTestData);
    }
  });

  app.get('/articulo/:articulo/colorDistr', async (req, res) => {
    const { articulo } = req.params;
    serverLog(`GET /articulo/${articulo}/colorDistr`);

    if (isPackaged) {
      try {
        const result = await sql.query(getArticuloColorDistr(articulo));
        res.json(result.recordset);
      } catch (err) {
        serverLog(`[ERROR] GET /articulo/${articulo}/colorDistr: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /articulo/:articulo/colorDistr');
      res.json(articuloColorDistrTestData);
    }
  });

  app.get('/articulo/:articulo/colorCodes', async (req, res) => {
    const { articulo } = req.params;
    serverLog(`GET /articulo/${articulo}/colorCodes`);

    if (isPackaged) {
      try {
        const result = await sql.query(getArticuloColorCodes(articulo));
        res.json(result.recordset);
      } catch (err) {
        serverLog(`[ERROR] GET /articulo/${articulo}/colorCodes: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /articulo/:articulo/colorCodes');
      res.json(articuloColorCodesTestData);
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

    if (isPackaged) {
      try {
        const result = await sql.query(
          `SELECT * FROM SEA_COLORES ORDER BY Color`
        );
        res.json(result.recordset);
      } catch (err) {
        serverLog(`[ERROR] GET /colors: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /colors');
      res.json(colorsTestData);
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

  async function getParsedMachines(producing = false) {
    let machines = await sql.query(getMachines());
    machines = machines.recordset;
    await parseMachines(machines);

    if (producing) {
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
    }

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

    if (isPackaged) {
      try {
        let machines = await getParsedMachines(true);
        res.json(machines);
      } catch (err) {
        serverLog(`[ERROR] GET /machines/producing: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /machines/producing');
      res.json(producingTestData);
    }
  });

  app.get('/machines/newColorCodes', async (req, res) => {
    serverLog('GET /machines/newColorCodes');

    if (isPackaged) {
      try {
        let machines = await getParsedMachines(true);
        machines = Array.from(
          new Map(
            machines
              .filter((m) => m.StyleCode.colorId === null)
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
    } else {
      // test data
      serverLog('Using test data for /machines/newColorCodes');
      res.json(newColorCodesTestData);
    }
  });

  app.get('/produccion', async (req, res) => {
    serverLog('GET /produccion');
    serverLog(JSON.stringify(req.query));

    if (isPackaged) {
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
    } else {
      // test data
      serverLog('Using test data for /produccion');
      res.json(produccionTestData);
    }
  });

  app.get('/programada', async (req, res) => {
    serverLog('GET /programada');

    if (isPackaged) {
      try {
        const { startDate, endMonth, endYear } = req.query;
        const [progColor, machines] = await Promise.all([
          // get Programada with Color, month production, and docenas by art.
          sql.query(getProgColorTable(startDate, endMonth, endYear)),
          !req.query.endMonth ? getParsedMachines(true) : null, // get Machines
        ]);

        res.json({
          progColor: progColor.recordset,
          machines: machines,
        });
      } catch (err) {
        serverLog(`[ERROR] GET /programada: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else if (!req.query.endMonth) {
      // test data
      serverLog('Using test data for /programada');
      res.json(programadaTestData);
    } else {
      // test data for month
      serverLog('Using test data for /programada (anterior)');
      res.json(programadaAnteriorTestData);
    }
  });

  app.get('/programada/actualDate', async (req, res) => {
    serverLog('GET /programada/actualDate');

    if (isPackaged) {
      try {
        const result = await sql.query(getProgActualDate());
        res.json(result.recordset);
      } catch (err) {
        serverLog(`[ERROR] GET /programada/actualDate: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /programada/actualDate');
      res.json(actualDateTestData);
    }
  });

  app.post('/programada/calculateNewTargets', async (req, res) => {
    serverLog('POST /programada/calculateNewTargets');
    const progUpdates = req.body;

    if (isPackaged) {
      try {
        const machines = await getParsedMachines(true);
        const targets = await calculateNewTargets(progUpdates, machines);

        res.json(targets);
      } catch (err) {
        serverLog(`[ERROR] POST /programada/calculateNewTargets: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /programada/calculateNewTargets');
      res.json(calculateNewTargetsTestData);
    }
  });

  app.post('/programada/compare', async (req, res) => {
    serverLog('POST /programada/compare');
    const data = req.body;

    if (isPackaged) {
      try {
        const currProg = await sql.query(getProgramada(data.startDate));
        const diff = compareProgramada(currProg.recordset, data.new);
        res.json(diff);
        // const result = await sql.query(query);
      } catch (err) {
        serverLog(`[ERROR] POST /programada/compare: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /programada/compare');
      res.json(compareTestData);
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

    if (isPackaged) {
      try {
        const now = dayjs();
        await sql.query(insertProgramada(data, 'inserted', now));
        serverLog('POST /programada/insertAll - SUCCESS');
        // return inserted rows to calculate new targets
        const result = await sql.query(getProgColor(now));
        res.json(result.recordset);
      } catch (err) {
        serverLog(`[ERROR] POST /programada/insertAll: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test
      serverLog('Test for /programada/insertAll');
    }
  });

  app.get('/programada/insertStartDate', async (req, res) => {
    serverLog('GET /programada/insertStartDate');
    const { date, month, year } = req.query;

    if (isPackaged) {
      try {
        await sql.query(insertProgStartDate({ date, month, year }));
        serverLog('POST /programada/insertStartDate - SUCCESS');
        res.status(204).end();
      } catch (err) {
        serverLog(`[ERROR] GET /programada/insertStartDate: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Test for /programada/insertStartDate');
    }
  });

  app.get('/programada/loadDates', async (req, res) => {
    serverLog('GET /programada/loadDates');

    if (isPackaged) {
      try {
        const result = await sql.query(getProgLoadDates());
        res.json(result.recordset);
      } catch (err) {
        serverLog(`[ERROR] GET /programada/loadDates: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /programada/loadDates');
      res.json(loadDatesTestData);
    }
  });

  app.get('/programada/total/:startDate', async (req, res) => {
    serverLog('GET /programada/total');
    const { startDate } = req.params;

    if (isPackaged) {
      try {
        const result = await sql.query(getProgramadaTotal(startDate));
        res.json(result.recordset);
      } catch (err) {
        serverLog(`[ERROR] GET /programada/total: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /programada/total');
      res.json(programadaTotalTestData);
    }
  });

  app.post('/programada/update', async (req, res) => {
    serverLog('POST /programada/update');
    const data = req.body;

    if (isPackaged) {
      try {
        const now = dayjs();
        await sql.query(updateProgramada(data, now));
        serverLog('POST /programada/update - SUCCESS');
        // return inserted rows to calculate new targets
        // include deleted articulos to stop machines
        const result = await sql.query(getProgColor(now, true));
        res.json(result.recordset);
      } catch (err) {
        serverLog(`[ERROR] POST /programada/update: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /programada/update');
      res.json(previousRecordTestData);
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
};

// startServer();
