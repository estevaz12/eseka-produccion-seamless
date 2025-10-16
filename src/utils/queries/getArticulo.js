const sql = require('mssql');

const getArticulo = async (pool, articulo) => {
  return pool.request().input('articulo', sql.Numeric(7, 2), Number(articulo))
    .query(`
    SELECT *
    FROM APP_ARTICULOS
    WHERE Articulo = @articulo;
  `);
};

module.exports = getArticulo;
