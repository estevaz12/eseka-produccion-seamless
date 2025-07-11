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

    // Check if talle is a PARCHE and set correct talle and punto
    if (talle === 9) {
      // set correct talle
      const color1 = parseInt(color[0]);
      const color2 = parseInt(color[1]);
      if (!isNaN(color1)) {
        talle = color1;
      } else if (!isNaN(color2)) {
        talle = color2;
      } else {
        talle = 1;
      }

      // set correct punto if articulo is an Int
      if (Number.isInteger(articulo)) {
        // if aticulo is int, then it came from the styleCode and we need to
        // assign correct punto. otherwise, the result of getArticulo below
        // will be incorrect
        articulo += 0.9;
        // needed for correct tipo, e.g. 5223% vs 5223.9
      }
    }

    try {
      const res = await sql.query(getArticulo(articulo));
      tipo = res.recordset[0]?.Tipo ?? null;
    } catch (err) {
      serverLog(`[ERROR] [parseStyleCode] Articulo doesn't exist: ${articulo}`);
    }

    return {
      styleCode,
      // need to clear punto for proper form entry
      articulo: talle === 9 ? parseInt(articulo) : articulo,
      tipo,
      talle,
      color,
      colorId,
    };
  } else {
    return {
      styleCode,
      articulo, // will be string of non-digit chars
      tipo: null,
      talle: null,
      color: null,
      colorId: null,
    };
  }
};

module.exports = parseStyleCode;
