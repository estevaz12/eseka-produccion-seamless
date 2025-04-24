const express = require('express');
// const sql = require('mssql');
const cors = require('cors');
const { default: produccion } = require('./utils/queries/produccion');

const app = express();
app.use(cors());

const conifg = {
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

sql
  .connect(conifg.db)
  .then(() => {
    console.log('Connected to database');
  })
  .catch((err) => {
    console.log('Error connecting to database:', err);
  });

app.listen(conifg.port, () => {
  console.log(`Listening at http://localhost:${conifg.port}`);
});

app.get('/hello', (req, res) => {
  console.log('/hello HIT');
  res.json({ data: 'Hello from server!' });
});

app.get('/produccion', async (req, res) => {
  console.log('/produccion HIT');
  try {
    const result = await sql.query(produccion);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
