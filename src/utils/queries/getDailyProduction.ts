import sql from 'mssql';
import dayjs from 'dayjs';
import type { DailyProd, Room } from '../../types';
import type { ConnectionPool, IResult } from 'mssql';

type DailyProduction = Promise<IResult<DailyProd>>;

async function getDailyProduction(
  pool: ConnectionPool,
  room: Room
): DailyProduction {
  const docena = room === 'SEAMLESS' ? 12 : 24;
  const porcExtra = room === 'SEAMLESS' ? 1.01 : 1.02;

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

  // Sets days to be from 6:00:01 to 6:00:00
  const sixToSix = `
  DATEADD(DAY, 
    CASE 
      WHEN CAST(DateRec AS TIME) <= '06:00:00.000' THEN -1 
      ELSE 0 
    END, CAST(DateRec AS DATE))
  `;

  return pool
    .request()
    .input('room', sql.Char(30), room)
    .input('monthStart', sql.VarChar, monthStart)
    .input('yesterday', sql.VarChar, yesterday)
    .input('docena', sql.Int, Number(docena))
    .input('porcExtra', sql.Float, Number(porcExtra)).query(`
    WITH ProdByDate AS (
      SELECT 
        LEFT(StyleCode, 8) AS StyleCode,
        ${sixToSix} AS ProdDate,
        SUM(Pieces) AS Unidades
      FROM PRODUCTIONS_MONITOR
      WHERE RoomCode = @room
        AND DateRec BETWEEN @monthStart AND @yesterday
        AND StyleCode <> ''
      GROUP BY LEFT(StyleCode, 8), ${sixToSix}
    )
    ,ProdColorUngroupedByDate AS (
        SELECT 
          p.ProdDate,
        -- Necessary for comparison with programada
          'Unidades' = CASE
            WHEN a.Tipo = '#' THEN p.Unidades * 2
            WHEN a.Tipo IS NULL THEN p.Unidades
            ELSE p.Unidades / 2
          END
        FROM ProdByDate AS p
            JOIN APP_COLOR_CODES AS cc
                ON p.StyleCode = cc.StyleCode
            JOIN APP_ARTICULOS AS a 
                ON a.Articulo = cc.Articulo
    )
    SELECT ProdDate,
           CAST(ROUND((SUM(Unidades) / @docena / @porcExtra), 0) AS INT) AS Docenas
    FROM ProdColorUngroupedByDate
    WHERE Unidades > 0
    GROUP BY ProdDate
    ORDER BY ProdDate
  `);
}

export default getDailyProduction;
