const insertColorCodes = (data) => {
  let query = '';
  for (const row of data.colorCodes) {
    query += `
      -- For machines/newColorCodes
      IF NOT EXISTS (SELECT * FROM SEA_ARTICULOS WHERE Articulo = ${data.articulo})
        INSERT INTO SEA_ARTICULOS (Articulo, Tipo)
          VALUES (${data.articulo}, ${data.tipo});

      INSERT INTO SEA_COLOR_CODES (Articulo, Color, Code)
        VALUES (${data.articulo}, ${row.color}, '${row.code}');\n 
    `;
  }

  return query;
};

module.exports = insertColorCodes;
