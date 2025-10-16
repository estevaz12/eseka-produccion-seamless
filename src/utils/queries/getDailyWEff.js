const sql = require('mssql');

const getDailyWEff = async (pool, room) => {
  return pool.request().input('room', sql.Char(30), room).query(`
      SELECT ProdDate, RoomCode, WorkEfficiency 
      FROM WEff_Diario
      WHERE RoomCode = @room AND WorkEfficiency > 0
      ORDER BY ProdDate
    `);
};

module.exports = getDailyWEff;
