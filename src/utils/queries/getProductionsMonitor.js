const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

// TODO: fix date timezone and stuff for entire app
dayjs.extend(utc);
dayjs.extend(timezone);

const getProductionsMonitor = (
  articulo,
  talle,
  color,
  startDate,
  fromMonthStart = true,
  endDate = null
) => {
  fromMonthStart = fromMonthStart === 'true' ? true : false;
  endDate = endDate === 'null' ? null : endDate;
  let prodStartDate, prodEndDate;

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

  return `
    SELECT pm.DateRec, pm.Shift, pm.MachCode, pm.StyleCode, pm.Pieces, 
            pm.OrderPieces, pm.TargetPieces, pm.Discards
    FROM PRODUCTIONS_MONITOR as pm
    WHERE SUBSTRING(pm.StyleCode, 1, 8) IN (
        SELECT cc.StyleCode
        FROM SEA_COLOR_CODES AS cc
        WHERE cc.Articulo = ${articulo} 
              AND cc.Talle = ${talle} 
              AND cc.Color = ${color}
        )
        AND pm.DateRec BETWEEN '${prodStartDate}' AND '${prodEndDate}'
        AND pm.Pieces > 0
    ORDER BY DateRec DESC;
  `;
};

module.exports = getProductionsMonitor;
