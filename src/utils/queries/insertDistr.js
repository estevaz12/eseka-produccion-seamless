const insertDistr = (data) => {
  let query = '';
  for (const row of data.colorDistr) {
    query += `
      INSERT INTO SEA_COLOR_DISTR (Articulo, Color, Porcentaje)
      VALUES (${data.articulo}, ${row.color}, ${
      row.porcentaje && row.porcentaje !== '0' ? row.porcentaje / 100 : null
    });\n
    `;
  }

  return query;
};

module.exports = insertDistr;
