const sql = require('mssql');

const getArticuloByStyleCode = async (pool, styleCode) => {
  return pool.request().input('styleCode', sql.Char(8), styleCode).query(`
    SELECT Articulo, Talle, Color
    FROM APP_COLOR_CODES
    WHERE StyleCode = @styleCode;
  `);
};

module.exports = getArticuloByStyleCode;
