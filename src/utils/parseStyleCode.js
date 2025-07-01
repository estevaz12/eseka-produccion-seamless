const sql = require('mssql');
const serverLog = require('./serverLog.js');
const getArticulo = require('./queries/getArticulo.js');
const getArticuloByStyleCode = require('./queries/getArticuloByStyleCode.js');

const parseStyleCode = async (styleCode) => {
  styleCode = styleCode.trim().substring(0, 8);
  let articulo = styleCode.substring(0, 5);
  let tipo = null;
  const talle = styleCode.substring(5, 6);
  const color = styleCode.substring(6, 8);
  let colorId = null;

  if (/^\d{5}$/.test(articulo)) {
    // articulo must be a 5-digit string
    try {
      const res = await sql.query(getArticuloByStyleCode(styleCode));
      // will be undefined if not there
      // undefined means that it is not in COLOR_CODES
      articulo = res.recordset[0]?.Articulo ?? null;
      colorId = res.recordset[0]?.Color ?? null;
    } catch (err) {
      serverLog(
        `[ERROR] [parseStyleCode] StyleCode not in COLOR_CODES: ${styleCode}`
      );
    }

    try {
      const res = await sql.query(getArticulo(articulo));
      tipo = res.recordset[0]?.Tipo ?? null;
    } catch (err) {
      serverLog(`[ERROR] [parseStyleCode] Articulo doesn't exist: ${articulo}`);
    }
  }

  return {
    styleCode,
    articulo,
    tipo,
    talle: parseInt(talle),
    color,
    colorId,
  };
};

module.exports = parseStyleCode;
