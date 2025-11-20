const sql = require('mssql');

const updateProgColorDoc = async (pool, data) => {
  return pool
    .request()
    .input('docenas', sql.Decimal(7, 2), Number(data.docenas))
    .input('programadaId', sql.Int, Number(data.programadaId))
    .input('colorDistrId', sql.SmallInt, Number(data.colorDistrId)).query(`
      UPDATE APP_PROG_COLOR
      SET Docenas = @docenas
      WHERE Programada = @programadaId 
            AND ColorDistr = @colorDistrId
    ;`);
};

module.exports = updateProgColorDoc;
