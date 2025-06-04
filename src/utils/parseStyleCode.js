import sql from 'mssql';
import { getColorId } from './queries/getColorId.js';
import serverLog from './serverLog.js';

const parseStyleCode = async (styleCode) => {
  styleCode = styleCode.trim().substring(0, 8);
  const articulo = styleCode.substring(0, 5);
  const talle = styleCode.substring(5, 6);
  const color = styleCode.substring(6, 8);
  let colorId = null;

  if (/^\d{5}$/.test(articulo)) {
    // articulo must be a 5-digit string
    // TODO: if colorId null, ask to insert in COLOR_CODES and repeat
    try {
      colorId = await sql.query(getColorId(articulo, color));
      colorId = colorId.recordset[0]?.Id; // will be undefined if not there
      // undefined colorId means that it is not in COLOR_CODES
    } catch (err) {
      serverLog(
        `[ERROR] [parseStyleCode] Please add to COLOR_CODES: ${articulo}, ${color}`
      );
    }
  }

  return {
    styleCode,
    articulo: parseInt(articulo),
    talle: parseInt(talle),
    color: color,
    colorId: colorId ? colorId : null, // already an int
  };
};

export { parseStyleCode };
