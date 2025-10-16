const sql = require('mssql');

const getArticuloColorCodes = async (pool, articulo) => {
  return pool.request().input('articulo', sql.Numeric(7, 2), Number(articulo)).query(`
    SELECT *
    FROM APP_COLOR_CODES
    WHERE Articulo = @articulo;
  `);
};

module.exports = getArticuloColorCodes;
