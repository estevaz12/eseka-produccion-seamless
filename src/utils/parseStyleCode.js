const sql = require('mssql');
const serverLog = require('./serverLog.js');
const getArticulo = require('./queries/getArticulo.js');
const getArticuloByStyleCode = require('./queries/getArticuloByStyleCode.js');

const parseStyleCode = async (styleCode) => {
  styleCode = styleCode.trim().substring(0, 8);
  let articulo = styleCode.substring(0, 5);
  let punto = null;
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
      articulo = res.recordset[0]?.Articulo ?? articulo;
      punto =
        typeof articulo !== 'string' ? Math.round((articulo % 1) * 100) : null;
      colorId = res.recordset[0]?.Color ?? null;
      // if 9, preserve it for PARCHE processing
      talle = talle !== 9 ? res.recordset[0]?.Talle ?? talle : talle;
    } catch (err) {
      serverLog(
        `[ERROR] [parseStyleCode] StyleCode not in COLOR_CODES: ${styleCode}`
      );
    }

    // Check if talle is a PARCHE and set correct talle and punto to retrieve
    // proper articulo data
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

      // set correct punto if articulo is string because not found
      // if aticulo is string, then it came from the styleCode and we need to
      // assign correct punto. otherwise, the result of getArticulo below
      // will be incorrect
      // needed for correct tipo, e.g. 5223% vs 5223.9
      if (typeof articulo === 'string') {
        // if articulo is not string it already has .9, otherwise we need to
        // assign it if talle is 9
        punto = 9;
      }
    } else if (typeof articulo === 'string') {
      // if articulo is string, then .0 was not found, check for .1
      try {
        const res = await sql.query(getArticulo(`${articulo}.1`));
        articulo = res.recordset[0]?.Articulo ?? articulo;
        punto = typeof articulo !== 'string' ? 1 : null;
      } catch (err) {
        serverLog(
          `[ERROR] [parseStyleCode] ${articulo}.1 not in SEA_ARTICULOS`
        );
      }
    }

    try {
      const res = await sql.query(
        getArticulo(punto ? `${parseInt(articulo)}.${punto}` : articulo)
      );
      tipo = res.recordset[0]?.Tipo ?? null;
    } catch (err) {
      serverLog(
        `[ERROR] [parseStyleCode] Articulo doesn't exist: ${articulo} - ${err.message}`
      );
    }

    return {
      styleCode,
      // need to clear punto for proper form entry
      articulo: parseInt(articulo),
      punto,
      tipo,
      talle,
      color,
      colorId,
    };
  } else {
    return {
      styleCode,
      articulo, // will be string of non-digit chars
      punto: null,
      tipo: null,
      talle: null,
      color: null,
      colorId: null,
    };
  }
};

module.exports = parseStyleCode;
