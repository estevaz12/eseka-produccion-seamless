const sql = require('mssql');

const getProgLoadDates = async (pool, room) => {
  return pool.request().input('room', sql.NVarChar(10), room).query(`
    SELECT *
    FROM APP_PROG_LOAD_DATES
    WHERE RoomCode = @room
    ORDER BY Date DESC;
  `);
};

module.exports = getProgLoadDates;
