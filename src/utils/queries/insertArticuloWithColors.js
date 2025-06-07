const insertDistr = require('./insertDistr');
const insertColorCodes = require('./insertColorCodes');

const insertArticuloWithColors = (data) => {
  let query = `
    INSERT INTO SEA_ARTICULOS (Articulo, Tipo)
     VALUES (${data.articulo}, ${
    data.tipo && data.tipo !== '' ? `'${data.tipo}'` : null
  });\n
  `;

  query += insertDistr(data);
  query += insertColorCodes(data);

  return query;
};

module.exports = insertArticuloWithColors;
