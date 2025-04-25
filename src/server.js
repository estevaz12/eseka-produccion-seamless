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
//     console.log('Connected to database');
//   })
//   .catch((err) => {
//     console.error('Error connecting to database:', err);
//   });

app.listen(config.port, () => {
  console.log(`[SERVER] Listening at http://localhost:${config.port}`);
});

app.get('/hello', (req, res) => {
  console.log('[SERVER] /hello HIT');
  res.json({ data: 'Hello from server!' });
});

app.get('/produccion', async (req, res) => {
  console.log('[SERVER] /produccion HIT');
  try {
    const result = await sql.query(`SELECT TOP 1 * FROM PRODUCTIONS_MONITOR`);
    res.json(result.recordset);
  } catch (err) {
    console.error('[SERVER] SQL Error:', err);
    res.status(500).json({ error: err.message });
  }
});
