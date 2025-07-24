const sql = require('mssql');
const updateArticuloTipo = require('../test-data/updateArticulo');
const serverLog = require('../serverLog');

const insertColorCodes = async (data) => {
  let query = '';
  const tipo = !data.tipo || data.tipo === '' ? null : `'${data.tipo}'`;

  for (const row of data.colorCodes) {
    let articulo = [];
    try {
      // Check if articulo exists
      articulo = await sql.query(
        `SELECT * FROM SEA_ARTICULOS WHERE Articulo = ${data.articulo}`
      );
      articulo = articulo.recordset;
      let articuloAction = '';
      if (articulo.length === 0) {
        // If articulo does not exist, insert it
        articuloAction = `
          INSERT INTO SEA_ARTICULOS (Articulo, Tipo)
            VALUES (${data.articulo}, ${tipo});
        `;
      } else if (articulo[0].Tipo !== tipo) {
        // If articulo exists but Tipo is different, update it
        articuloAction = updateArticuloTipo(data.articulo, data.tipo);
      }

      query += `
        ${articuloAction}        
  
        INSERT INTO SEA_COLOR_CODES (Articulo, Color, Code, Talle, StyleCode)
          VALUES (${data.articulo}, ${row.color}, '${row.code}', ${data.talle}, '${data.styleCode}');\n 
      `;
    } catch (err) {
      serverLog(
        `[ERROR] /colorCodes/insert: Error fetching art. ${data.articulo}: ${err.message}`
      );
    }
  }

  return query;
};

module.exports = insertColorCodes;
