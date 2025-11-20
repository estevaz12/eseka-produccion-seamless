const sql = require('mssql');

const getProgActualDate = async (pool, room) => {
  return pool.request().input('room', sql.NVarChar(10), room).query(`
    SELECT TOP (1) *
    FROM APP_PROG_LOAD_DATES
    WHERE RoomCode = @room
    ORDER BY Date DESC;
  `);
};

module.exports = getProgActualDate;
