const sql = require('mssql');
const getColorId = require('./queries/getColorId.js');
const serverLog = require('./serverLog.js');
const getArticulo = require('./queries/getArticulo.js');

const parseStyleCode = async (styleCode) => {
  styleCode = styleCode.trim().substring(0, 8);
  const articulo = styleCode.substring(0, 5);
  let tipo = null;
  const talle = styleCode.substring(5, 6);
  const color = styleCode.substring(6, 8);
  let colorId = null;

  if (/^\d{5}$/.test(articulo)) {
    // articulo must be a 5-digit string
    try {
      colorId = await sql.query(getColorId(articulo, color));
      colorId = colorId.recordset[0]?.Id; // will be undefined if not there
      // undefined colorId means that it is not in COLOR_CODES
    } catch (err) {
      serverLog(
        `[ERROR] [parseStyleCode] Please add to COLOR_CODES: ${articulo}, ${color}`
      );
    }

    try {
      tipo = await sql.query(getArticulo(articulo));
      tipo = tipo.recordset[0]?.Tipo;
    } catch (err) {
      serverLog(`[ERROR] [parseStyleCode] Articulo doesn't exist: ${articulo}`);
    }
  }

  return {
    styleCode,
    articulo: parseInt(articulo),
    tipo: tipo,
    talle: parseInt(talle),
    color: color,
    colorId: colorId, // already an int
  };
};

module.exports = parseStyleCode;
