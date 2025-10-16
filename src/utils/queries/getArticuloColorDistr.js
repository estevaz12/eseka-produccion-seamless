const sql = require('mssql');

const getArticuloColorDistr = async (pool, articulo) => {
  return pool.request().input('articulo', sql.Numeric(7, 2), Number(articulo))
    .query(`
    SELECT DISTINCT Talle
    FROM APP_COLOR_DISTR
    WHERE Articulo = @articulo;
  `);
};

module.exports = getArticuloColorDistr;
