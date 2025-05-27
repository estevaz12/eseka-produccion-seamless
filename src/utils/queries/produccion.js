// TODO: warn when articulo not in color_codes.
// TODO: modify produccion view with new query
const produccion = (room, startDate, endDate, articulo, actual) => {
  /* Machine states
  0: RUN
  2: STOP BUTTON
  3: AUTOMATIC STOP
  4: TARGET
  5: F1
  6: ELECTRÓNICO
  7: MECANICO
  9: HILADO
  */
  let query;
  if (actual === 'true') {
    // JOIN with MACHINES for live data
    query = `
    WITH Produccion AS (
        SELECT 
            -- Use the first 8 characters of the StyleCode.
            LEFT(COALESCE(pm.StyleCode, m.StyleCode), 8) AS StyleCode,
            COALESCE(SUM(pm.Pieces), 0) + COALESCE(MAX(m.LastpiecesSum), 0) AS Unidades,
            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM Machines m2
                    WHERE m2.StyleCode = COALESCE(pm.StyleCode, m.StyleCode)
                    AND m2.state IN (0,2,3,4,5,6,7,9)
                )
                THEN 'SI: ' + (
                            SELECT STUFF((
                                SELECT DISTINCT '-' + CONVERT(VARCHAR, m2.MachCode)
                                FROM Machines m2
                                WHERE m2.StyleCode = COALESCE(pm.StyleCode, m.StyleCode)
                                    AND m2.state IN (0, 2, 3, 4, 5, 6, 7, 9)
                                FOR XML PATH(''), TYPE
                            ).value('.', 'NVARCHAR(MAX)'), 1, 1, '')
                        )
                ELSE 'NO'
            END AS Produciendo
        FROM PRODUCTIONS_MONITOR pm
        FULL JOIN (
            SELECT StyleCode, SUM(Lastpieces) AS LastpiecesSum
            FROM Machines
            WHERE RoomCode = '${room}'
            GROUP BY StyleCode
        ) m 
        ON pm.StyleCode = m.StyleCode
        WHERE 
            pm.RoomCode = '${room}'
            AND pm.DateRec BETWEEN '${startDate}' AND '${endDate}'
            AND pm.Pieces > 0
            AND LEFT(pm.StyleCode, 8) LIKE '%${articulo}%'
        GROUP BY COALESCE(pm.StyleCode, m.StyleCode)
    )
    `;
  } else {
    // only PRODUCTIONS_MONITOR
    query = `
        WITH Produccion AS (
            SELECT 
                pm.StyleCode,
                SUM(pm.Pieces) AS 'Unidades',
                'Produciendo' = CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM Machines m2
                        WHERE m2.StyleCode = pm.StyleCode
                            AND m2.state IN (0, 2, 3, 4, 5, 6, 7, 9)
                    ) THEN 'SI: ' + (
                       SELECT STUFF((
                           SELECT DISTINCT '-' + CONVERT(VARCHAR, m2.MachCode)
                           FROM Machines m2
                           WHERE m2.StyleCode = pm.StyleCode
                               AND m2.state IN (0, 2, 3, 4, 5, 6, 7, 9)
                           FOR XML PATH(''), TYPE
                       ).value('.', 'NVARCHAR(MAX)'), 1, 1, '')
                    )
                    ELSE 'NO'
                END
            FROM PRODUCTIONS_MONITOR pm
                LEFT JOIN MACHINES m ON pm.StyleCode = m.StyleCode AND pm.MachCode = m.MachCode
            WHERE pm.RoomCode = '${room}'
                AND DateRec BETWEEN '${startDate}' AND '${endDate}'
                AND pm.Pieces > 0
                AND LEFT(pm.StyleCode, 8) LIKE '%${articulo}%'
            GROUP BY pm.StyleCode
        )
    `;
  }

  // Match with SEA_COLOR_CODES and return a record per color
  // TODO: Fix produciendo column to include machines
  return (
    query +
    `
        SELECT 
            cc.Articulo, 
            CAST(SUBSTRING(p.StyleCode, 6, 1) AS INT) AS Talle,
            c.Color,
            c.Id AS ColorId,
            SUM(p.Unidades) AS Unidades
        FROM Produccion AS p
            JOIN SEA_COLOR_CODES AS cc
                ON SUBSTRING(p.StyleCode, 7, 2) = cc.Code
                AND CONVERT(INT, LEFT(p.StyleCode, 5)) = CAST(cc.Articulo AS INT)
            JOIN SEA_COLORES AS c
                ON c.Id = cc.Color
        GROUP BY cc.Articulo, CAST(SUBSTRING(p.StyleCode, 6, 1) AS INT), cc.Color, c.Color, c.Id
        ORDER BY cc.Articulo, Talle, cc.Color;
    `
  );
};

export default produccion;
