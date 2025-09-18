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
        const result = await sql.query(queries.getArticulo(articulo));
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
        const result = await sql.query(queries.getArticuloColorDistr(articulo));
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
        const result = await sql.query(queries.getArticuloColorCodes(articulo));
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
        const result = await sql.query(
          queries.getCurrArtColorDistr(articulo, null)
        );
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
        const result = await sql.query(
          queries.getCurrArtColorDistr(articulo, talle)
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
      res.json(testData.colors);
    }
  });

  async function insertColorDistrs(data) {
    for (const row of data.colorDistr) {
      const query = queries.insertDistr(data.articulo, data.talle, row);
      serverLog(query);
      await sql.query(query);
      // Wait before next insert
      await new Promise((resolve) => setTimeout(resolve, 1));
    }
  }

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
    const { articulo, talle, color, startDate, fromMonthStart, endDate } =
      req.query;
    serverLog(
      `GET /historial for ${articulo} ${talle} ${color} ${startDate} ${fromMonthStart} ${endDate}`
    );

    if (isPackaged) {
      try {
        const query = queries.getProductionsMonitor(
          articulo,
          talle,
          color,
          startDate,
          fromMonthStart,
          endDate
        );
        serverLog(query);
        const result = await sql.query(query);
        res.json(result.recordset);
      } catch (err) {
        serverLog(
          `[ERROR] GET /historial for ${articulo} ${talle} ${color} ${startDate}: ${err}`
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
    room,
    onlyProducing = false,
    onlyValidCodes = true
  ) {
    let machines = await sql.query(queries.getMachines(room));
    machines = machines.recordset;
    await parseMachines(machines);

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
          machines = await getParsedMachines(room, false, false);
        else {
          const machsNYL = await getParsedMachines('MUJER', false, false);
          const machsALG = await getParsedMachines('HOMBRE', false, false);
          const machsSEA = await getParsedMachines('SEAMLESS', false, false);
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
        let machines = await getParsedMachines(room, true);
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
        const result = await sql.query(
          queries.produccion(
            room,
            startDate,
            endDate,
            actual,
            articulo,
            talle,
            colorId
          )
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
          sql.query(
            queries.getProgColorTable(
              room,
              startDate,
              startMonth,
              startYear,
              endDate
            )
          ),
          !req.query.startMonth ? getParsedMachines(room, true) : null, // get Machines
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
        const result = await sql.query(queries.getProgActualDate(room));
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

  app.get('/:room/programada/loadDates', async (req, res) => {
    const { room } = req.params;
    serverLog(`GET /${room}/programada/loadDates`);

    if (isPackaged) {
      try {
        const result = await sql.query(queries.getProgLoadDates(room));
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
        const result = await sql.query(
          queries.getProgramadaTotal(room, startDate)
        );
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

  // stats for dashboard
  app.get('/:room/stats/dailyProduction', async (req, res) => {
    const { room } = req.params;
    serverLog(`GET /${room}/stats/dailyProduction`);

    if (isPackaged) {
      try {
        const result = await sql.query(queries.getDailyProduction(room));
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
        const result = await sql.query(queries.getDailyWEff(room));

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
        const result = await sql.query(queries.getMonthSaldo(room));
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
