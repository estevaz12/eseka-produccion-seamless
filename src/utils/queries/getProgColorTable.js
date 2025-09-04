const dayjs = require('dayjs');
const produccion = require('./produccion');

const getProgColorTable = (
  room,
  startDate,
  startMonth = null,
  startYear = null,
  endDate = null
) => {
  let prodStartDate, prodEndDate;
  if (startMonth && startYear) {
    // month starts first day of month at 6am + 1 second
    prodStartDate = dayjs
      .tz()
      .month(startMonth - 1)
      .year(startYear)
      .startOf('month')
      .hour(6)
      .minute(0)
      .second(1)
      .format(process.env.SQL_DATE_FORMAT);
    // month always ends on the first day of the next month at 6am
    prodEndDate = dayjs
      .tz()
      .month(startMonth - 1)
      .year(startYear)
      .endOf('month') // 30th or 31st at 11:59:59
      .add(1, 'day')
      .hour(6)
      .minute(0)
      .second(0)
      .format(process.env.SQL_DATE_FORMAT);
  } else {
    // current date
    prodStartDate = dayjs
      .tz()
      .startOf('month')
      .hour(6)
      .minute(0)
      .second(1)
      .format(process.env.SQL_DATE_FORMAT);
    prodEndDate = dayjs.tz().format(process.env.SQL_DATE_FORMAT);
  }

  // get Month Production
  const monthProd = produccion(
    room,
    prodStartDate,
    prodEndDate,
    endDate === null ? true : false,
    '',
    '',
    '',
    false
  );

  // monthProd query already has WITH clause
  return `
    ${monthProd}
    SELECT pc.*, COALESCE(p.Unidades, 0) AS Producido
    FROM View_Prog_Color AS pc
      LEFT JOIN ProdColor as p
        ON p.Articulo = pc.Articulo 
           AND p.Talle = pc.Talle 
           AND p.ColorId = pc.ColorId
    WHERE pc.RoomCode = '${room}' 
          AND pc.Fecha = (
            SELECT MAX(pc2.Fecha)
            FROM View_Prog_Color AS pc2
            WHERE pc2.Articulo = pc.Articulo 
                  AND pc2.Talle = pc.Talle
                  ${
                    startMonth && startYear && endDate
                      ? `AND pc2.Fecha < '${endDate}'`
                      : ''
                  }
            )
          ${
            startMonth && startYear && endDate
              ? `AND pc.Fecha >= '${startDate}' AND pc.Fecha < '${endDate}'`
              : `AND pc.Fecha >= '${startDate}'`
          } 
          AND pc.DocProg > 0
    ORDER BY pc.Articulo, pc.Talle, pc.Porcentaje DESC, pc.Color;
  `;
};

module.exports = getProgColorTable;
