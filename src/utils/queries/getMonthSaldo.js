const sql = require('mssql');
const dayjs = require('dayjs');

const getMonthSaldo = async (pool, room) => {
  const roomLower = room.toLowerCase();
  const roomFirstCap = roomLower.charAt(0).toUpperCase() + roomLower.slice(1);

  const monthStart = dayjs
    .tz()
    .startOf('month')
    .hour(6)
    .minute(0)
    .second(1)
    .format(process.env.SQL_DATE_FORMAT);

  const yesterday = dayjs
    .tz()
    .hour(6)
    .minute(0)
    .second(0)
    .format(process.env.SQL_DATE_FORMAT);

  return pool
    .request()
    .input('monthStart', sql.VarChar, monthStart)
    .input('yesterday', sql.VarChar, yesterday).query(`
    SELECT SUM(DefPieces) AS Saldo, 
           SUM(Pieces) AS Pieces
    FROM View_ProdMon_TcMin_${roomFirstCap}
    WHERE DefCode <> 101 AND (DateRec BETWEEN @monthStart AND @yesterday)
  `);
};

module.exports = getMonthSaldo;
