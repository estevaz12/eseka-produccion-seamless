const sql = require('mssql');
const serverLog = require('./serverLog.js');
const getArticulo = require('./queries/getArticulo.js');
const getArticuloByStyleCode = require('./queries/getArticuloByStyleCode.js');

const parseStyleCode = async (styleCode) => {
  styleCode = styleCode.trim().substring(0, 8);
  let articulo = styleCode.substring(0, 5);
  let tipo = null;
  let talle = parseInt(styleCode.substring(5, 6));
  const color = styleCode.substring(6, 8);
  let colorId = null;

  if (/^\d{5}$/.test(articulo)) {
    // articulo must be a 5-digit string
    try {
      const res = await sql.query(getArticuloByStyleCode(styleCode));
      // will be undefined if not there
      // undefined means that it is not in COLOR_CODES
      // if articulo null, then just use the styleCode
      articulo = res.recordset[0]?.Articulo ?? parseInt(articulo);
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

    // Check if talle is a PARCHE and set correct talle
    if (talle === 9) {
      const color1 = parseInt(color[0]);
      const color2 = parseInt(color[1]);
      if (!isNaN(color1)) {
        talle = color1;
      } else if (!isNaN(color2)) {
        talle = color2;
      } else {
        talle = 1;
      }
    }
  }

  return {
    styleCode,
    articulo,
    tipo,
    talle,
    color,
    colorId,
  };
};

module.exports = parseStyleCode;
