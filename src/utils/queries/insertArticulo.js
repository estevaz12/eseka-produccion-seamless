const sql = require('mssql');

const insertArticulo = async (pool, articulo, tipo) => {
  return pool
    .request()
    .input('articulo', sql.Numeric(7, 2), Number(articulo))
    .input('tipo', sql.Char(1), tipo && tipo !== '' ? tipo : null).query(`
      INSERT INTO APP_ARTICULOS (Articulo, Tipo)
       VALUES (@articulo, @tipo);\n
  `);
};

module.exports = insertArticulo;
