import sql from 'mssql';
import dayjs from 'dayjs';
import type { ConnectionPool, IResult } from 'mssql';
import type { ProductionsMonitorRow } from '../../types';

type ProductionsMonitor = Promise<IResult<ProductionsMonitorRow>>;

interface PMQueryParams {
  machCode: number;
  articulo: number;
  talle: number;
  color: number;
  startDate: string;
  fromMonthStart: boolean | 'true' | 'false';
  endDate: string | null;
}

async function getProductionsMonitor(
  pool: ConnectionPool,
  query: PMQueryParams
): ProductionsMonitor {
  let {
    machCode,
    articulo,
    talle,
    color,
    startDate,
    fromMonthStart = true,
    endDate = null,
  } = query || {};

  fromMonthStart = fromMonthStart === 'true' ? true : false;
  endDate = endDate === 'null' ? null : endDate;
  let prodStartDate: string, prodEndDate: string;

  // month starts first day of month at 6am + 1 second
  prodStartDate = fromMonthStart
    ? dayjs
        .tz(startDate)
        .startOf('month')
        .hour(6)
        .minute(0)
        .second(1)
        .format(process.env.SQL_DATE_FORMAT)
    : dayjs(startDate).tz().format(process.env.SQL_DATE_FORMAT);

  // month always ends on the first day of the next month at 6am
  prodEndDate = endDate
    ? dayjs(endDate).tz().format(process.env.SQL_DATE_FORMAT)
    : dayjs
        .tz(startDate)
        .endOf('month')
        .add(1, 'day')
        .hour(6)
        .minute(0)
        .second(0)
        .format(process.env.SQL_DATE_FORMAT);

  return pool
    .request()
    .input('machCode', sql.Int, Number(machCode))
    .input('articulo', sql.Numeric(7, 2), Number(articulo))
    .input('talle', sql.TinyInt, Number(talle))
    .input('color', sql.SmallInt, Number(color))
    .input('prodStartDate', sql.VarChar, prodStartDate)
    .input('prodEndDate', sql.VarChar, prodEndDate).query(`
    SELECT pm.DateRec, pm.Shift, pm.MachCode, pm.StyleCode, pm.Pieces, 
            pm.OrderPieces, pm.TargetPieces, pm.Discards
    FROM PRODUCTIONS_MONITOR as pm
    WHERE SUBSTRING(pm.StyleCode, 1, 8) IN (
        SELECT cc.StyleCode
        FROM APP_COLOR_CODES AS cc
        WHERE ${
          machCode
            ? `pm.MachCode = @machCode`
            : `cc.Articulo = @articulo 
              AND cc.Talle = @talle 
              AND cc.Color = @color`
        }
        )
        AND pm.DateRec BETWEEN @prodStartDate AND @prodEndDate
    ORDER BY DateRec DESC;
  `);
}

export default getProductionsMonitor;
