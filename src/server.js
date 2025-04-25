const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const { default: produccion } = require('./utils/queries/produccion');

const app = express();
app.use(cors());

const config = {
  port: 3001,
  db: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  },
};

// sql
//   .connect(config.db)
//   .then(() => {
//    process.parentPort.postMessage('Connected to database');
//   })
//   .catch((err) => {
//     console.error('Error connecting to database:', err);
//   });

app.listen(config.port, () => {
  process.parentPort.postMessage(
    `Listening at http://localhost:${config.port}`
  );
});

app.get('/hello', (req, res) => {
  process.parentPort.postMessage('/hello HIT');
  res.json({ data: 'Hello from server!' });
});

app.get('/produccion', async (req, res) => {
  process.parentPort.postMessage('/produccion HIT');
  try {
    const result = await sql.query(`SELECT TOP 1 * FROM PRODUCTIONS_MONITOR`);
    res.json(result.recordset);
  } catch (err) {
    process.parentPort.postMessage('[ERROR] SQL Error:', err);
    res.status(500).json({ error: err.message });
  }
});
