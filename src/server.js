// TODO: api docs
// FIXME - sql injections
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
// Utils
const serverLog = require('./utils/serverLog.js');
const processPDF = require('./utils/processPDF.js');
const compareProgramada = require('./utils/compareProgramada.js');
const calculateNewTargets = require('./utils/calculateNewTargets.js');
const parseMachines = require('./utils/parseMachines.js');
const exportTablePDF = require('./utils/exportTablePDF.js');
const calcEff = require('./utils/calcEff.js');
// Queries
const queries = require('./utils/queries');
// test data
const testData = require('./utils/test-data');

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

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Buenos_Aires');

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
  let pool;
  if (isPackaged) {
    (async () => {
      try {
        pool = await sql.connect(config.db);
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
        const result = await queries.getArticulo(pool, articulo);
        res.json(result.recordset);
      } catch (err) {
        serverLog(`[ERROR] GET /articulo/${articulo}: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /articulo/:articulo');
      res.json(testData.articulo);
    }
  });

  app.get('/articulo/:articulo/colorDistr', async (req, res) => {
    const { articulo } = req.params;
    serverLog(`GET /articulo/${articulo}/colorDistr`);

    if (isPackaged) {
      try {
        const result = await queries.getArticuloColorDistr(pool, articulo);
        res.json(result.recordset);
      } catch (err) {
        serverLog(`[ERROR] GET /articulo/${articulo}/colorDistr: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /articulo/:articulo/colorDistr');
      res.json(testData.articuloColorDistr);
    }
  });

  app.get('/articulo/:articulo/colorCodes', async (req, res) => {
    const { articulo } = req.params;
    serverLog(`GET /articulo/${articulo}/colorCodes`);

    if (isPackaged) {
      try {
        const result = await queries.getArticuloColorCodes(pool, articulo);
        res.json(result.recordset);
      } catch (err) {
        serverLog(`[ERROR] GET /articulo/${articulo}/colorCodes: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /articulo/:articulo/colorCodes');
      res.json(testData.articuloColorCodes);
    }
  });

  app.get('/articulo/:articulo/currentColorDistr', async (req, res) => {
    const { articulo } = req.params;
    serverLog(`GET /articulo/${articulo}/currentColorDistr`);

    if (isPackaged) {
      try {
        const result = await queries.getCurrArtColorDistr(pool, articulo, null);
        res.json(result.recordset);
      } catch (err) {
        serverLog(
          `[ERROR] GET /articulo/${articulo}/currentColorDistr: ${err}`
        );
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog(`Using test data for /articulo/${articulo}/currentColorDistr`);
      res.json(testData.articuloColorDistr);
    }
  });

  app.get('/articulo/:articulo/:talle/currentColorDistr', async (req, res) => {
    const { articulo, talle } = req.params;
    serverLog(`GET /articulo/${articulo}/${talle}/currentColorDistr`);

    if (isPackaged) {
      try {
        const result = await queries.getCurrArtColorDistr(
          pool,
          articulo,
          talle
        );
        res.json(result.recordset);
      } catch (err) {
        serverLog(
          `[ERROR] GET /articulo/${articulo}/${talle}/currentColorDistr: ${err}`
        );
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog(
        `Using test data for /articulo/${articulo}/${talle}/currentColorDistr`
      );
      res.json(testData.articuloColorDistr);
    }
  });

  app.post('/articulo/insert', async (req, res) => {
    serverLog('POST /articulo/insert');
    const data = req.body;

    try {
      await queries.insertArticulo(pool, data.articulo, data.tipo);
      res
        .status(200)
        .json({ message: `Art. ${data.articulo} agregado con éxito.` });
    } catch (err) {
      serverLog(`[ERROR] POST /articulo/insert: ${err}`);
      res.status(500).json({
        message: `No se pudo agregar el art. ${data.articulo}.`,
        error: err.message,
      });
    }
  });

  app.post('/articulo/updateTipo', async (req, res) => {
    serverLog('POST /articulo/updateTipo');
    const { articulo, tipo } = req.body;

    try {
      await queries.updateArticuloTipo(pool, articulo, tipo);
      res
        .status(200)
        .json({ message: `Tipo del art. ${articulo} modificado con éxito.` });
    } catch (err) {
      serverLog(`[ERROR] POST /articulo/updateTipo: ${err}`);
      res.status(500).json({
        message: `No se pudo modificar el tipo del art. ${articulo}.`,
        error: err.message,
      });
    }
  });

  app.get('/cambios', async (req, res) => {
    const { startDate, room } = req.query;
    serverLog(`GET /cambios for ${startDate} ${room}`);

    if (isPackaged) {
      try {
        const result = await queries.getCambios(
          pool,
          dayjs.tz(startDate).format('YYYY-MM-DD'),
          room
        );
        res.json(result.recordset);
      } catch (err) {
        serverLog(`[ERROR] GET /cambios for ${startDate} ${room}: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /cambios');
      res.json(testData.cambios);
    }
  });

  app.get('/colors', async (req, res) => {
    serverLog('GET /colors');

    if (isPackaged) {
      try {
        const result = await sql.query(
          `SELECT * FROM APP_COLORES ORDER BY Color`
        );
        res.json(result.recordset);
      } catch (err) {
        serverLog(`[ERROR] GET /colors: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /colors');
      res.json(testData.colors);
    }
  });

  app.post('/colors/insert', async (req, res) => {
    serverLog('POST /colors/insert');
    const data = req.body;

    if (isPackaged) {
      try {
        await queries.insertColor(pool, data);
        const result = await sql.query(
          `SELECT TOP(1) * FROM APP_COLORES ORDER BY Id DESC`
        );
        res.status(201).json({
          message: `Color ${data.color} agregado con éxito.`,
          data: result.recordset,
        });
      } catch (err) {
        serverLog(`[ERROR] POST /colors/insert: ${err}`);
        res.status(500).json({
          message: `No se pudo agregar el color ${data.color}.`,
          error: err.message,
        });
      }
    } else {
      // test data
      serverLog('Using test data for /colors/insert');
      res.json([{ Id: 999, Color: 'TEST COLOR' }]);
    }
  });

  app.post('/colorCodes/insert', async (req, res) => {
    serverLog('POST /colorCodes/insert');
    const data = req.body;

    try {
      await queries.insertColorCodes(pool, data);
      res
        .status(201)
        .json({ message: `Código ${data.styleCode} agregado con éxito.` });
    } catch (err) {
      serverLog(`[ERROR] POST /colorCodes/insert: ${err}`);
      res.status(500).json({
        message: `No se pudo agregar el código ${data.styleCode}.`,
        error: err.message,
      });
    }
  });

  async function insertColorDistrs(pool, data) {
    for (const row of data.colorDistr) {
      await queries.insertDistr(pool, data.articulo, data.talle, row);
      // Wait before next insert
      await new Promise((resolve) => setTimeout(resolve, 1));
    }
  }

  app.post('/colorDistr/insert', async (req, res) => {
    serverLog('POST /colorDistr/insert');
    const data = req.body;

    try {
      await insertColorDistrs(pool, data);

      res.status(201).json({
        message: `Distribución para el art. ${data.articulo} T${data.talle} agregada con éxito.`,
      });
    } catch (err) {
      serverLog(`[ERROR] POST /colorDistr/insert: ${err}`);
      res.status(500).json({
        message: `No se pudo agregar la distribución para el art. ${data.articulo} T${data.talle}.`,
        error: err.message,
      });
    }
  });

  app.post('/colorDistr/insertAllTalles', async (req, res) => {
    serverLog('POST /colorDistr/insertAllTalles');
    const { articulo, talles, colorDistr } = req.body;

    try {
      for (const talle of talles) {
        await insertColorDistrs(pool, { articulo, talle, colorDistr });
      }

      res.status(201).json({
        message: `Distribución para el art. ${articulo} agregada con éxito.`,
      });
    } catch (err) {
      serverLog(`[ERROR] POST /colorDistr/insertAllTalles: ${err}`);
      res.status(500).json({
        message: `No se pudo agregar la distribución para el art. ${articulo}.`,
        error: err.message,
      });
    }
  });

  app.post('/export/pdf', async (req, res) => {
    serverLog('POST /export/pdf');

    try {
      const pdf = await exportTablePDF(req.body);
      res
        .status(200)
        .json({ message: `PDF exportado a ${pdf}.`, filePath: pdf });
    } catch (err) {
      serverLog(`[ERROR] POST /export/pdf: ${err}`);
      res
        .status(500)
        .json({ message: 'Error exportando PDF.', error: err.message });
    }
  });

  app.get('/historial', async (req, res) => {
    serverLog(`GET /historial for ${JSON.stringify(req.query)}`);

    if (isPackaged) {
      try {
        const result = await queries.getProductionsMonitor(pool, req.query);
        res.json(result.recordset);
      } catch (err) {
        serverLog(
          `[ERROR] GET /historial for ${JSON.stringify(req.query)}: ${err}`
        );
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /historial');
      res.json(testData.historial);
    }
  });

  // get machines and parse to match with production data
  async function getParsedMachines(
    pool,
    room,
    onlyProducing = false,
    onlyValidCodes = true
  ) {
    let machines = await queries.getMachines(pool, room);
    machines = machines.recordset;
    await parseMachines(pool, machines);

    if (onlyValidCodes)
      machines = machines.filter(
        (m) => typeof m.StyleCode.articulo !== 'string'
      );

    if (onlyProducing) {
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

  app.get('/:room/machines', async (req, res) => {
    const { room } = req.params;
    serverLog(`GET /${room}/machines`);

    if (isPackaged) {
      try {
        let machines = [];

        if (room !== 'ELECTRONICA')
          machines = await getParsedMachines(pool, room, false, false);
        else {
          const machsNYL = await getParsedMachines(pool, 'MUJER', false, false);
          const machsALG = await getParsedMachines(
            pool,
            'HOMBRE',
            false,
            false
          );
          const machsSEA = await getParsedMachines(
            pool,
            'SEAMLESS',
            false,
            false
          );
          machines = [...machsNYL, ...machsALG, ...machsSEA];
        }

        res.json(machines);
      } catch (err) {
        serverLog(`[ERROR] GET /${room}/machines: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // use test data
      serverLog(`Using test data for /${room}/machines`);
      res.json(testData.machines);
    }
  });

  app.get('/:room/machines/newColorCodes', async (req, res) => {
    const { room } = req.params;
    serverLog(`GET /${room}/machines/newColorCodes`);

    if (isPackaged) {
      try {
        let machines = await getParsedMachines(pool, room, true);
        machines = Array.from(
          new Map(
            machines
              .filter((m) => m.StyleCode.colorId === null)
              // makes the entries unique by articulo and colorCode
              // 2+ machines can have the same articulo and color
              .map((m) => [
                `${m.StyleCode.articulo}${`.${m.StyleCode.punto}` || ''}_${
                  m.StyleCode.color
                }`,
                m,
              ])
          ).values()
        );
        res.json(machines);
      } catch (err) {
        serverLog(`[ERROR] GET /${room}/machines/newColorCodes: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog(`Using test data for /${room}/machines/newColorCodes`);
      res.json(testData.newColorCodes);
    }
  });

  app.get('/produccion', async (req, res) => {
    serverLog('GET /produccion');
    serverLog(JSON.stringify(req.query));

    if (isPackaged) {
      try {
        const { room, startDate, endDate, actual, articulo, talle, colorId } =
          req.query;
        const result = await queries.runProduccion(
          pool,
          room,
          startDate,
          endDate,
          actual,
          articulo,
          talle,
          colorId
        );
        res.json(result.recordset);
      } catch (err) {
        serverLog(`[ERROR] GET /produccion: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /produccion');
      res.json(testData.produccion);
    }
  });

  app.get('/:room/programada', async (req, res) => {
    const { room } = req.params;
    serverLog(`GET /${room}/programada`);

    if (isPackaged) {
      try {
        const { startDate, startMonth, startYear, endDate } = req.query;
        const [progColor, machines] = await Promise.all([
          // get Programada with Color, month production, and docenas by art.
          queries.getProgColorTable(
            pool,
            room,
            startDate,
            startMonth,
            startYear,
            endDate
          ),
          !req.query.startMonth ? getParsedMachines(pool, room, true) : null, // get Machines
        ]);

        // match machines with rows
        let rows = progColor.recordset;
        rows = [...rows].map((row) => {
          // add empty array to avoid errors in ProgAnteriores view
          if (!machines) return { ...row, Machines: [] };

          const matchingMachines = machines.filter(
            // match machines with articulo
            (m) => {
              const machArticulo = m.StyleCode.punto
                ? parseFloat(`${m.StyleCode.articulo}.${m.StyleCode.punto}`)
                : m.StyleCode.articulo;

              return (
                machArticulo === row.Articulo &&
                m.StyleCode.talle === row.Talle &&
                m.StyleCode.colorId === row.ColorId
              );
            }
          );

          return {
            ...row,
            Machines: matchingMachines.sort((a, b) => a.MachCode - b.MachCode),
          };
        });

        res.json(rows);
      } catch (err) {
        serverLog(`[ERROR] GET /${room}/programada: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else if (!req.query.endMonth) {
      // test data
      serverLog(`Using test data for /${room}/programada`);
      res.json(testData.programada);
    } else {
      // test data for month
      serverLog(`Using test data for /${room}/programada (anterior)`);
      res.json(testData.programadaAnterior);
    }
  });

  app.get('/:room/programada/actualDate', async (req, res) => {
    const { room } = req.params;
    serverLog(`GET /${room}/programada/actualDate`);

    if (isPackaged) {
      try {
        const result = await queries.getProgActualDate(pool, room);
        res.json(result.recordset);
      } catch (err) {
        serverLog(`[ERROR] GET /${room}/programada/actualDate: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /programada/actualDate');
      res.json(testData.actualDate);
    }
  });

  app.post('/:room/programada/calculateNewTargets', async (req, res) => {
    const { room } = req.params;
    serverLog(`POST /${room}/programada/calculateNewTargets`);
    const progUpdates = req.body;

    if (isPackaged) {
      try {
        const machines = await getParsedMachines(pool, room, true);
        const targets = await calculateNewTargets(pool, progUpdates, machines);

        res.json(targets);
      } catch (err) {
        serverLog(
          `[ERROR] POST /${room}/programada/calculateNewTargets: ${err}`
        );
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog(`Using test data for /${room}/programada/calculateNewTargets`);
      res.json(testData.calculateNewTargets);
    }
  });

  app.post('/:room/programada/compare', async (req, res) => {
    const { room } = req.params;
    serverLog(`POST /${room}/programada/compare`);
    const data = req.body;

    if (isPackaged) {
      try {
        const currProg = await queries.getProgramada(
          pool,
          room,
          data.startDate
        );
        const diff = compareProgramada(currProg.recordset, data.new);
        res.json(diff);
      } catch (err) {
        serverLog(`[ERROR] POST /${room}/programada/compare: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /programada/compare');
      res.json(testData.compare);
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

  app.post('/:room/programada/insertAll', async (req, res) => {
    const { room } = req.params;
    serverLog(`POST /${room}/programada/insertAll`);
    const data = req.body;

    if (isPackaged) {
      try {
        const now = dayjs.tz();
        await queries.insertProgramada(pool, data, room, 'inserted', now);
        serverLog(`POST /${room}/programada/insertAll - SUCCESS`);
        // return inserted rows to calculate new targets
        const result = await queries.getProgColor(pool, room, now);
        res.status(201).json({
          message: `Programada nueva cargada con éxito.`,
          inserted: result.recordset,
        });
      } catch (err) {
        serverLog(`[ERROR] POST /${room}/programada/insertAll: ${err}`);
        res.status(500).json({
          message: `No se pudo cargar la programada correctamente.`,
          error: err.message,
        });
      }
    } else {
      // test
      serverLog(`Test for /${room}/programada/insertAll`);
    }
  });

  app.post('/:room/programada/insertStartDate', async (req, res) => {
    const { room } = req.params;
    serverLog(`POST /${room}/programada/insertStartDate`);
    const data = req.body;

    if (isPackaged) {
      try {
        await queries.insertProgStartDate(pool, data, room);
        serverLog(`POST /${room}/programada/insertStartDate - SUCCESS`);
        res.status(200).json({
          message: `Fecha de inicio de programada cargada con éxito.`,
        });
      } catch (err) {
        serverLog(`[ERROR] POST /${room}/programada/insertStartDate: ${err}`);
        res.status(500).json({
          message: `No se pudo cargar la fecha de inicio de programada correctamente.`,
          error: err.message,
        });
      }
    } else {
      // test data
      serverLog(`Test for /${room}/programada/insertStartDate`);
    }
  });

  app.get('/:room/programada/loadDates', async (req, res) => {
    const { room } = req.params;
    serverLog(`GET /${room}/programada/loadDates`);

    if (isPackaged) {
      try {
        const result = await queries.getProgLoadDates(pool, room);
        res.json(result.recordset);
      } catch (err) {
        serverLog(`[ERROR] GET /${room}/programada/loadDates: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog(`Using test data for /${room}/programada/loadDates`);
      res.json(testData.loadDates);
    }
  });

  app.get('/:room/programada/total/:startDate', async (req, res) => {
    const { room, startDate } = req.params;
    serverLog(`GET /${room}/programada/total`);

    if (isPackaged) {
      try {
        const result = await queries.getProgramadaTotal(pool, room, startDate);
        res.json(result.recordset);
      } catch (err) {
        serverLog(`[ERROR] GET /${room}/programada/total: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog(`Using test data for /${room}/programada/total`);
      res.json(testData.programadaTotal);
    }
  });

  app.post('/:room/programada/update', async (req, res) => {
    const { room } = req.params;
    serverLog(`POST /${room}/programada/update`);
    const data = req.body;

    if (isPackaged) {
      try {
        const now = dayjs.tz();
        await queries.updateProgramada(pool, room, data, now);
        serverLog(`POST /${room}/programada/update - SUCCESS`);
        // return inserted rows to calculate new targets
        // include deleted articulos to stop machines
        const result = await queries.getProgColor(pool, room, now, true);
        res.status(201).json({
          message: `Cambios cargados con éxito.`,
          inserted: result.recordset,
        });
      } catch (err) {
        serverLog(`[ERROR] POST /programada/update: ${err}`);
        res.status(500).json({
          message: `No se pudieron cargar los cambios correctamente.`,
          error: err.message,
        });
      }
    } else {
      // test data
      serverLog('Using test data for /programada/update');
      res.json(testData.previousRecord);
    }
  });

  app.post('/programada/updateDocenas', async (req, res) => {
    serverLog('POST /programada/updateDocenas');
    const data = req.body;

    try {
      await queries.updateProgColorDoc(pool, data);
      serverLog('POST /programada/updateDocenas - SUCCESS');
      res.status(201).json({
        message: `Docenas agregadas con éxito para el art. ${data.articulo} T${data.talle} ${data.color}.`,
      });
    } catch (err) {
      serverLog(`[ERROR] POST /programada/updateDocenas: ${err}`);
      res.status(500).json({
        message: `No se pudo agregar las docenas para el art. ${data.articulo} T${data.talle} ${data.color}.`,
        error: err.message,
      });
    }
  });

  // stats for dashboard
  app.get('/:room/stats/dailyProduction', async (req, res) => {
    const { room } = req.params;
    serverLog(`GET /${room}/stats/dailyProduction`);

    if (isPackaged) {
      try {
        const result = await queries.getDailyProduction(pool, room);
        res.json(result.recordset);
      } catch (err) {
        serverLog(`[ERROR] GET /${room}/stats/dailyProduction: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /stats/dailyProduction');
      res.json(testData.dailyProduction);
    }
  });

  app.get('/:room/stats/currentEfficiency', async (req, res) => {
    const { room } = req.params;
    serverLog(`GET /${room}/stats/currentEfficiency`);

    if (isPackaged) {
      try {
        const result = await sql.query(queries.getCurrWEff());
        const groupEffs = calcEff(room, result.recordset);

        res.json(groupEffs);
      } catch (err) {
        serverLog(`[ERROR] GET /${room}/stats/currentEfficiency: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /stats/currentEfficiency');
      res.json(testData.currWEff);
    }
  });

  app.get('/:room/stats/dailyEfficiency', async (req, res) => {
    const { room } = req.params;
    serverLog(`GET /${room}/stats/dailyEfficiency`);

    if (isPackaged) {
      try {
        const result = await queries.getDailyWEff(pool, room);

        res.json(result.recordset);
      } catch (err) {
        serverLog(`[ERROR] GET /${room}/stats/dailyEfficiency: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /stats/dailyEfficiency');
      res.json(testData.dailyWEff);
    }
  });

  app.get('/:room/stats/monthSaldo', async (req, res) => {
    const { room } = req.params;
    serverLog(`GET /${room}/stats/monthSaldo`);

    const docenas = room === 'SEAMLESS' ? 12 : 24;

    if (isPackaged) {
      try {
        const result = await queries.getMonthSaldo(pool, room);
        const row = result.recordset[0]; // single-record
        // prep data for chart
        const porc = ((row.Saldo / (row.Pieces + row.Saldo)) * 100).toFixed(2);
        const saldo = {
          porc: isNaN(porc) ? 0 : porc,
          data: [
            { id: 0, value: Math.round(row.Saldo / docenas), label: 'Saldo' },
            {
              id: 1,
              value: Math.round(row.Pieces / docenas),
              label: 'Restante',
            },
          ],
        };

        res.json(saldo);
      } catch (err) {
        serverLog(`[ERROR] GET /${room}/stats/monthSaldo: ${err}`);
        res.status(500).json({ error: err.message });
      }
    } else {
      // test data
      serverLog('Using test data for /stats/monthSaldo');
      res.json(testData.monthSaldo);
    }
  });
};

// startServer();
