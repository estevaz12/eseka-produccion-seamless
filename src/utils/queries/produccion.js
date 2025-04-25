const fechaInicio = '2025-04-01T06:00:00.000Z';
const fechaFin = new Date().toISOString();

const produccion = `
SELECT
    COALESCE(pm.StyleCode, m.StyleCode) AS 'StyleCode',
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
        WHERE RoomCode = 'SEAMLESS'
        GROUP BY StyleCode
    ) m ON pm.StyleCode = m.StyleCode
WHERE (
    (pm.RoomCode = 'SEAMLESS' 
    AND pm.DateRec BETWEEN '${fechaInicio}' AND '${fechaFin}')
    OR pm.StyleCode IS NULL
)
GROUP BY COALESCE(pm.StyleCode, m.StyleCode)
ORDER BY StyleCode;
`;

export default produccion;

// let query;
// if (actual) {
//   query = `
//         SELECT COALESCE(pm.StyleCode, m.StyleCode) AS 'StyleCode',
//                COALESCE(SUM(pm.Pieces), 0) + COALESCE(MAX(m.LastpiecesSum), 0) AS 'Unidades',
//                'Produciendo' = CASE
//                    WHEN EXISTS (
//                        SELECT 1
//                        FROM Machines m2
//                        WHERE m2.StyleCode = COALESCE(pm.StyleCode, m.StyleCode)
//                            AND m2.state IN (0, 2, 3, 4, 5, 7)
//                    )
//                    THEN 'SI: ' + (
//                        SELECT STUFF((
//                            SELECT DISTINCT '-' + CONVERT(VARCHAR, m2.MachCode)
//                            FROM Machines m2
//                            WHERE m2.StyleCode = COALESCE(pm.StyleCode, m.StyleCode)
//                                AND m2.state IN (0, 2, 3, 4, 5, 7)
//                            FOR XML PATH(''), TYPE
//                        ).value('.', 'NVARCHAR(MAX)'), 1, 1, '')
//                    )
//                    ELSE 'NO'
//                END
//         FROM PRODUCTIONS_MONITOR pm
//         FULL JOIN (
//             SELECT StyleCode, SUM(Lastpieces) AS LastpiecesSum
//             FROM MACHINES
//             WHERE RoomCode = '${roomCode}'
//             GROUP BY StyleCode
//         ) m ON pm.StyleCode = m.StyleCode
//         WHERE (
//             (pm.RoomCode = '${roomCode}' AND pm.DateRec BETWEEN '${SQL_DATE_TIME_FORMATTER.format(
//     fechaInicio
//   )}' AND '${SQL_DATE_TIME_FORMATTER.format(fechaFin)}')
//             OR pm.StyleCode IS NULL
//         )
//         ${articulo.trim() ? `AND pm.StyleCode LIKE '%${articulo}%'` : ''}
//         GROUP BY COALESCE(pm.StyleCode, m.StyleCode)
//         ORDER BY StyleCode;
//     `;
// } else {
//   query = `
//         SELECT pm.StyleCode,
//                SUM(pm.Pieces) AS 'Unidades',
//                'Produciendo' = CASE
//                    WHEN EXISTS (
//                        SELECT 1
//                        FROM Machines m2
//                        WHERE m2.StyleCode = pm.StyleCode
//                            AND m2.state IN (0, 2, 3, 4, 5, 7)
//                    ) THEN 'SI: ' + (
//                        SELECT CONVERT(varchar, m2.MachCode) + '-' AS [text()]
//                        FROM Machines m2
//                        WHERE m2.StyleCode = pm.StyleCode
//                            AND m2.state IN (0, 2, 3, 4, 5, 7)
//                        FOR XML PATH (''), TYPE
//                    ).value('text()[1]', 'nvarchar(max)')
//                    ELSE 'NO'
//                END
//         FROM PRODUCTIONS_MONITOR pm
//         LEFT JOIN MACHINES m ON pm.StyleCode = m.StyleCode AND pm.MachCode = m.MachCode
//         WHERE pm.RoomCode = '${roomCode}'
//         AND DateRec BETWEEN '${SQL_DATE_TIME_FORMATTER.format(
//           fechaInicio
//         )}' AND '${SQL_DATE_TIME_FORMATTER.format(fechaFin)}'
//         ${articulo.trim() ? `AND pm.StyleCode LIKE '%${articulo}%'` : ''}
//         GROUP BY pm.StyleCode
//         ORDER BY pm.StyleCode;
//     `;
// }
