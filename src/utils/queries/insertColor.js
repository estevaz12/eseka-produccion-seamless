const sql = require('mssql');

const insertColor = async (pool, data) => {
  return pool.request().input('color', sql.VarChar(50), data.color).query(`
    INSERT INTO APP_COLORES (Color)
      VALUES (@color);
  `);
};

module.exports = insertColor;
