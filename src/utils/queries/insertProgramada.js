const dayjs = require('dayjs');

const insertProgramada = (data, room, status, date = dayjs.tz()) => {
  const FECHA = date.format(process.env.SQL_DATE_FORMAT);
  let query = '';

  for (const row of data) {
    if (status === 'inserted') {
      // no need to check if Articulo exists because it has already been inserted
      // through the view
      query += `
        INSERT INTO SEA_PROGRAMADA (Fecha, Articulo, Talle, Docenas, RoomCode)
          VALUES ('${FECHA}', ${row.articulo}, ${row.talle}, ${row.aProducir}, '${room}');\n\n
      `;
    } else if (status === 'deleted') {
      // no need to check if Articulo exists because it has already been inserted
      // Docenas set to 0 means deleted
      query += `
        INSERT INTO SEA_PROGRAMADA (Fecha, Articulo, Talle, Docenas, RoomCode)
          VALUES ('${FECHA}', ${row.articulo}, ${row.talle}, 0, '${room}');\n\n
      `;
    }
  }

  return query;
};

module.exports = insertProgramada;
