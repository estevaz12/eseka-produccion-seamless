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
  if (data.colorCodes) {
    // data.colorCodes will be undefined when coming from calculateNewTargets
    // instead, colorCodes will be inserted through newColorCodes
    query += insertColorCodes(data);
  }

  return query;
};

module.exports = insertArticuloWithColors;
