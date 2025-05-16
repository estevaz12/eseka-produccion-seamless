const insertProgramada = (data) => {
  let query = '';
  for (const row of data) {
    query += `
    IF NOT EXISTS (SELECT Articulo FROM SEA_ARTICULOS WHERE Articulo = ${row.articulo})
      INSERT INTO SEA_ARTICULOS (Articulo, Tipo)
        VALUES (${row.articulo}, NULL); 

    INSERT INTO SEA_PROGRAMADA (Articulo, Talle, Docenas)
      VALUES (${row.articulo}, ${row.talle}, ${row.aProducir});\n\n
  `;
  }

  return query;
};

export { insertProgramada };
