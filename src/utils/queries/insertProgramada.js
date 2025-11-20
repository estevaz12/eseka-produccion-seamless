const sql = require('mssql');
const dayjs = require('dayjs');
const { runQuery } = require('../queryUtils');

const insertProgramada = async (
  pool,
  data,
  room,
  status,
  date = dayjs.tz()
) => {
  const FECHA = date.format(process.env.SQL_DATE_FORMAT);

  const request = { query: '', params: [] };

  data.forEach((row, i) => {
    request.query += `
      INSERT INTO APP_PROGRAMADA (Fecha, Articulo, Talle, Docenas, RoomCode)
        VALUES (@fecha${i}, @articulo${i}, @talle${i}, @aProducir${i}, @room${i});
    `;

    request.params.push(
      {
        name: `fecha${i}`,
        type: sql.VarChar,
        value: FECHA,
      },
      {
        name: `articulo${i}`,
        type: sql.Numeric(7, 2),
        value: Number(row.articulo),
      },
      {
        name: `talle${i}`,
        type: sql.TinyInt,
        value: Number(row.talle),
      },
      {
        name: `aProducir${i}`,
        type: sql.SmallInt,
        value: status === 'inserted' ? Number(row.aProducir) : 0,
      },
      {
        name: `room${i}`,
        type: sql.NVarChar(10),
        value: room,
      }
    );
  });

  return runQuery(pool, request);
};

module.exports = insertProgramada;
