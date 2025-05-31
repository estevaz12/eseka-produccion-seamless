import dayjs from 'dayjs';

// TODO: ask to insert Tipo and ColorDistr if Articulo doesn't exist
const insertProgramada = (data, status, date = dayjs()) => {
  const FECHA = date.format(process.env.SQL_DATE_FORMAT);
  let query = '';

  for (const row of data) {
    // TODO: see if 'added' is necessary for insertAll endpoint
    if (status === 'added') {
      query += `
      IF NOT EXISTS (SELECT Articulo FROM SEA_ARTICULOS WHERE Articulo = ${row.articulo})
        INSERT INTO SEA_ARTICULOS (Articulo, Tipo)
          VALUES (${row.articulo}, NULL); 
  
      INSERT INTO SEA_PROGRAMADA (Fecha, Articulo, Talle, Docenas)
        VALUES ('${FECHA}', ${row.articulo}, ${row.talle}, ${row.aProducir});\n\n
    `;
    } else if (status === 'modified') {
      // no need to check if Articulo exists because it has already been inserted
      query += `
        INSERT INTO SEA_PROGRAMADA (Fecha, Articulo, Talle, Docenas)
          VALUES ('${FECHA}', ${row.articulo}, ${row.talle}, ${row.aProducir});\n\n
      `;
    } else if (status === 'deleted') {
      // no need to check if Articulo exists because it has already been inserted
      // Docenas set to 0 means deleted
      query += `
        INSERT INTO SEA_PROGRAMADA (Fecha, Articulo, Talle, Docenas)
          VALUES ('${FECHA}', ${row.articulo}, ${row.talle}, 0);\n\n
      `;
    }
  }

  return query;
};

export { insertProgramada };
