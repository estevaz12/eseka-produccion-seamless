const insertColorCodes = (data) => {
  let query = '';
  for (const row of data.colorCodes) {
    query += `
      INSERT INTO SEA_COLOR_CODES (Articulo, Color, Code)
        VALUES (${data.articulo}, ${row.color}, '${row.code}');\n 
    `;
  }

  return query;
};

module.exports = insertColorCodes;
