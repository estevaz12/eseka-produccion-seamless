const produccion = (room, startDate, endDate, articulo, actual) => {
  let query;
  if (actual === 'true') {
    // JOIN with MACHINES for live data
    query = `
        SELECT COALESCE(pm.StyleCode, m.StyleCode) AS 'StyleCode',
               COALESCE(SUM(pm.Pieces), 0) + COALESCE(MAX(m.LastpiecesSum), 0) AS 'Unidades',
               'Produciendo' = CASE
                   WHEN EXISTS (
                       SELECT 1
                       FROM Machines m2
                       WHERE m2.StyleCode = COALESCE(pm.StyleCode, m.StyleCode)
                           AND m2.state IN (0, 2, 3, 4, 5, 7)
                   )
                   THEN 'SI: ' + (
                       SELECT STUFF((
                           SELECT DISTINCT '-' + CONVERT(VARCHAR, m2.MachCode)
                           FROM Machines m2
                           WHERE m2.StyleCode = COALESCE(pm.StyleCode, m.StyleCode)
                               AND m2.state IN (0, 2, 3, 4, 5, 7)
                           FOR XML PATH(''), TYPE
                       ).value('.', 'NVARCHAR(MAX)'), 1, 1, '')
                   )
                   ELSE 'NO'
               END
        FROM PRODUCTIONS_MONITOR pm
        FULL JOIN (
            SELECT StyleCode, SUM(Lastpieces) AS LastpiecesSum
            FROM MACHINES
            WHERE RoomCode = '${room}'
            GROUP BY StyleCode
        ) m ON pm.StyleCode = m.StyleCode
        WHERE (
            (pm.RoomCode = '${room}' AND pm.DateRec BETWEEN '${startDate}' AND '${endDate}')
            AND pm.Pieces > 0
            ${articulo === '' ? '' : `AND pm.StyleCode LIKE '%${articulo}%'`}
        )
        GROUP BY COALESCE(pm.StyleCode, m.StyleCode)
        ORDER BY StyleCode;
    `;
  } else {
    // only PRODUCTIONS_MONITOR
    query = `
        SELECT pm.StyleCode,
               SUM(pm.Pieces) AS 'Unidades',
               'Produciendo' = CASE
                   WHEN EXISTS (
                       SELECT 1
                       FROM Machines m2
                       WHERE m2.StyleCode = pm.StyleCode
                           AND m2.state IN (0, 2, 3, 4, 5, 7)
                   ) THEN 'SI: ' + (
                       SELECT STUFF((
                           SELECT DISTINCT '-' + CONVERT(VARCHAR, m2.MachCode)
                           FROM Machines m2
                           WHERE m2.StyleCode = pm.StyleCode
                               AND m2.state IN (0, 2, 3, 4, 5, 7)
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
            ${articulo === '' ? '' : `AND pm.StyleCode LIKE '%${articulo}%'`}
        GROUP BY pm.StyleCode
        ORDER BY pm.StyleCode;
    `;
  }

  return query;
};

export default produccion;
