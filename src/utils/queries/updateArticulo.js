const sql = require('mssql');

const updateArticuloTipo = async (pool, articulo, tipo) => {
  return pool
    .request()
    .input('articulo', sql.Numeric(7, 2), Number(articulo))
    .input('tipo', sql.Char(1), !tipo || tipo === '' ? null : tipo).query(`
      UPDATE APP_ARTICULOS
      SET Tipo = @tipo
      WHERE Articulo = @articulo;
  `);
};

module.exports = updateArticuloTipo;
