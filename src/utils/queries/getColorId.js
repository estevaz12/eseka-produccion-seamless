const sql = require('mssql');

const getColorId = async (pool, styleCode) => {
  return pool.request().input('styleCode', sql.Char(8), styleCode).query(`
      SELECT DISTINCT c.Id
      FROM APP_COLORES AS c
        JOIN APP_COLOR_CODES AS cc 
          ON cc.Color = c.Id
      WHERE cc.StyleCode = @styleCode
    `);
};

module.exports = getColorId;
