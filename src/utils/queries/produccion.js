const produccion = (
  room,
  startDate,
  endDate,
  actual,
  articulo,
  talle,
  colorId,
  showResults = true
) => {
  if (typeof actual === 'string') {
    actual = actual === 'true' ? true : false;
  }
  articulo = `${articulo}`;
  talle = `${talle}`;
  colorId = `${colorId}`;

  let query;
  const precise = articulo.includes('.');
  let whereClause = 'WHERE';
  // Build dynamic WHERE clause based on talle, colorId, and precise/articulo
  const conditions = [];
  if (precise) {
    conditions.push(`Articulo = ${articulo}`);
  }
  if (talle.length > 0) {
    conditions.push(`Talle = ${talle}`);
  }
  if (colorId.length > 0) {
    conditions.push(`ColorId = ${colorId}`);
  }

  if (conditions.length > 0) {
    whereClause += ' ' + conditions.join(' AND ');
  } else {
    whereClause = ''; // No WHERE clause needed if no conditions
  }

  if (actual) {
    // JOIN with MACHINES for live data
    query = `
    WITH Produccion AS (
        SELECT 
            -- Use the first 8 characters of the StyleCode.
            LEFT(COALESCE(pm.StyleCode, m.StyleCode), 8) AS StyleCode,
            COALESCE(SUM(pm.Pieces), 0) + COALESCE(MAX(m.LastpiecesSum), 0) AS Unidades
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
            ${!precise ? `AND LEFT(pm.StyleCode, 8) LIKE '%${articulo}%'` : ''}
        GROUP BY COALESCE(pm.StyleCode, m.StyleCode)
    )
    `;
  } else {
    // only PRODUCTIONS_MONITOR
    query = `
        WITH Produccion AS (
            SELECT 
                pm.StyleCode,
                SUM(pm.Pieces) AS 'Unidades'
            FROM PRODUCTIONS_MONITOR pm
            WHERE pm.RoomCode = '${room}'
                AND DateRec BETWEEN '${startDate}' AND '${endDate}'
                AND pm.Pieces > 0
                ${
                  !precise
                    ? `AND LEFT(pm.StyleCode, 8) LIKE '%${articulo}%'`
                    : ''
                }
            GROUP BY pm.StyleCode
        )
    `;
  }

  // Match with SEA_COLOR_CODES and return a record per color
  // TODO: account for parches and stuff, colorcodes2
  return (
    query +
    `,ProdColorUngrouped AS (
        SELECT 
            cc.Articulo, 
            a.Tipo,
            cc.Talle,
            c.Color,
            c.Id AS ColorId,
            p.Unidades
        FROM Produccion AS p
            JOIN SEA_COLOR_CODES2 AS cc
                ON p.StyleCode = cc.StyleCode
            JOIN SEA_COLORES AS c
                ON c.Id = cc.Color
            JOIN SEA_ARTICULOS AS a 
                ON a.Articulo = cc.Articulo
    ),
    ProdColor AS (
        SELECT Articulo, Tipo, Talle, Color, ColorId, SUM(Unidades) AS Unidades
        FROM ProdColorUngrouped
        ${whereClause}
        GROUP BY Articulo, Tipo, Talle, Color, ColorId
    )
    ${
      showResults
        ? `
      SELECT *
      FROM ProdColor
      ORDER BY Articulo, Talle, Color;
      `
        : ''
    }
    `
  );
};

module.exports = produccion;
