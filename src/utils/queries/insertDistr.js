const sql = require('mssql');

const insertDistr = async (pool, articulo, talle, colorDistr) => {
  return pool
    .request()
    .input('articulo', sql.Numeric(7, 2), Number(articulo))
    .input('talle', sql.TinyInt, Number(talle))
    .input('color', sql.SmallInt, Number(colorDistr.color))
    .input(
      'porcentaje',
      sql.Float,
      colorDistr.porcentaje && colorDistr.porcentaje !== '0'
        ? Number(colorDistr.porcentaje)
        : null
    ).query(`
    INSERT INTO APP_COLOR_DISTR (Articulo, Talle, Color, Porcentaje)
    VALUES (@articulo, @talle, @color, @porcentaje);\n
  `);
};

module.exports = insertDistr;
