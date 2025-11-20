const dayjs = require('dayjs');
const sql = require('mssql');

const insertProgStartDate = async (pool, data, room) => {
  return pool
    .request()
    .input('date', sql.VarChar, data.date)
    .input('month', sql.TinyInt, Number(data.month))
    .input('year', sql.SmallInt, Number(data.year))
    .input('room', sql.NVarChar(10), room).query(`
      INSERT INTO APP_PROG_LOAD_DATES (Date, Month, Year, RoomCode)
        VALUES (@date, @month, @year, @room);
  `);
};

module.exports = insertProgStartDate;
