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
  let whereClause = '';
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
    whereClause += ' AND ' + conditions.join(' AND ');
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
            ${!precise ? `AND LEFT(pm.StyleCode, 8) LIKE '%${articulo}%'` : ''}
        GROUP BY COALESCE(pm.StyleCode, m.StyleCode)
    )
    `;
  } else {
    // only PRODUCTIONS_MONITOR
    query = `
      WITH Produccion AS (
        SELECT 
            LEFT(pm.StyleCode, 8) AS StyleCode,
            SUM(pm.Pieces) AS Unidades
        FROM PRODUCTIONS_MONITOR pm
        WHERE pm.RoomCode = '${room}'
            AND pm.DateRec BETWEEN '${startDate}' AND '${endDate}'
            ${!precise ? `AND LEFT(pm.StyleCode, 8) LIKE '%${articulo}%'` : ''}
        GROUP BY pm.StyleCode
      )
    `;
  }

  // Match with APP_COLOR_CODES and return a record per color
  return (
    query +
    `,ProdColorUngrouped AS (
        SELECT 
            cc.Articulo, 
            a.Tipo,
            cc.Talle,
            c.Color,
            c.Id AS ColorId,
            c.Hex,
            c.WhiteText,
            p.Unidades
        FROM Produccion AS p
            JOIN APP_COLOR_CODES AS cc
                ON p.StyleCode = cc.StyleCode
            JOIN APP_COLORES AS c
                ON c.Id = cc.Color
            JOIN APP_ARTICULOS AS a 
                ON a.Articulo = cc.Articulo
    ),
    ProdColor AS (
        SELECT Articulo, Tipo, Talle, Color, ColorId, Hex, WhiteText, SUM(Unidades) AS Unidades
        FROM ProdColorUngrouped
        WHERE Unidades > 0 ${whereClause}
        GROUP BY Articulo, Tipo, Talle, Color, ColorId, Hex, WhiteText
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
