const dayjs = require('dayjs');

const getDailyProduction = (room) => {
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

  return `
    WITH ProdByDate AS (
      SELECT 
        LEFT(StyleCode, 8) AS StyleCode,
        ${sixToSix} AS ProdDate,
        SUM(Pieces) AS Unidades
      FROM PRODUCTIONS_MONITOR
      WHERE RoomCode = '${room}'
        AND DateRec BETWEEN '${monthStart}' AND '${yesterday}'
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
            JOIN SEA_COLOR_CODES AS cc
                ON p.StyleCode = cc.StyleCode
            JOIN SEA_ARTICULOS AS a 
                ON a.Articulo = cc.Articulo
    )
    SELECT ProdDate,
           CAST(ROUND((SUM(Unidades) / 12 / 1.01), 0) AS INT) AS Docenas
    FROM ProdColorUngroupedByDate
    WHERE Unidades > 0
    GROUP BY ProdDate
    ORDER BY ProdDate
  `;
};

module.exports = getDailyProduction;
