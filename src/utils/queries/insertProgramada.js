const sql = require('mssql');
const dayjs = require('dayjs');

const insertProgramada = async (
  pool,
  data,
  room,
  status,
  date = dayjs.tz()
) => {
  const FECHA = date.format(process.env.SQL_DATE_FORMAT);

  const request = pool.request();

  data.forEach((row, i) => {
    request
      .input(`fecha${i}`, sql.VarChar, FECHA)
      .input(`articulo${i}`, sql.Numeric(7, 2), Number(row.articulo))
      .input(`talle${i}`, sql.TinyInt, Number(row.talle))
      .input(
        `aProducir${i}`,
        sql.SmallInt,
        status === 'inserted' ? Number(row.aProducir) : 0
      )
      .input(`room${i}`, sql.NVarChar(10), room);
  });

  // Build a multi-row insert
  const values = data
    .map(
      (_, i) =>
        `(@fecha${i}, @articulo${i}, @talle${i}, @aProducir${i}, @room${i})`
    )
    .join(',\n');

  const query = `
    INSERT INTO APP_PROGRAMADA (Fecha, Articulo, Talle, Docenas, RoomCode)
      VALUES ${values};`;

  return request.query(query);
};

module.exports = insertProgramada;
