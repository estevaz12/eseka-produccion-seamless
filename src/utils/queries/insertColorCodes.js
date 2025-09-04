const sql = require('mssql');
const updateArticuloTipo = require('./updateArticulo');
const serverLog = require('../serverLog');
const getArticulo = require('./getArticulo');
const insertArticulo = require('./insertArticulo');

const insertColorCodes = async (data) => {
  let query = '';
  // For proper parsing and comparing
  const punto = !data.punto || data.punto === '' ? 0 : data.punto;

  let articulo = [];
  try {
    // Check if articulo exists
    articulo = await sql.query(getArticulo(`${data.articulo}.${punto}`));
    articulo = articulo.recordset;

    let articuloAction = '';
    if (articulo.length === 0) {
      // If articulo does not exist, insert it
      articuloAction = insertArticulo(`${data.articulo}.${punto}`, data.tipo);
    } else if (articulo[0].Tipo !== data.tipo) {
      // If articulo exists but Tipo is different, update it
      articuloAction = updateArticuloTipo(
        `${data.articulo}.${punto}`,
        data.tipo
      );
    }

    query += `
      ${articuloAction}        
  
      INSERT INTO SEA_COLOR_CODES (Articulo, Color, Code, Talle, StyleCode)
        VALUES (${data.articulo}.${punto}, ${data.color}, '${data.code}', ${data.talle}, '${data.styleCode}');\n 
    `;
  } catch (err) {
    serverLog(
      `[ERROR] /colorCodes/insert: Error fetching art. ${data.articulo}.${punto}: ${err.message}`
    );
  }

  return query;
};

module.exports = insertColorCodes;
