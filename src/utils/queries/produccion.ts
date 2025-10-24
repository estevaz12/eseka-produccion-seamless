import type { ConnectionPool, IResult } from 'mssql';
import type { Produccion, Room, SQLQueryOpts } from '../../types';
import sql from 'mssql';

type ProduccionRes = Promise<IResult<Produccion>>;

type buildArgs = [
  room: Room,
  startDate: string,
  endDate: string,
  actual: boolean | 'true' | 'false',
  articulo: number | string,
  talle: number | string,
  colorId: number | string,
  showResults?: boolean,
];

function buildProduccion(
  ...[
    room,
    startDate,
    endDate,
    actual,
    articulo,
    talle,
    colorId,
    showResults = true,
  ]: buildArgs
): SQLQueryOpts {
  if (typeof actual === 'string') {
    actual = actual === 'true' ? true : false;
  }
  articulo = `${articulo}`;
  talle = `${talle}`;
  colorId = `${colorId}`;

  let baseCTE: string;
  const request: SQLQueryOpts = { query: null, params: [] };
  const precise = articulo.includes('.');
  let whereClause = '';
  // Build dynamic WHERE clause based on talle, colorId, and precise/articulo
  const conditions: string[] = [];

  if (precise) {
    conditions.push(`Articulo = @articulo`);
    request.params.push({
      name: 'articulo',
      type: sql.Numeric(7, 2),
      value: Number(articulo),
    });
  } else {
    request.params.push({
      name: 'articulo',
      type: sql.VarChar(8),
      value: `%${articulo}%`,
    });
  }

  if (talle.length > 0) {
    conditions.push(`Talle = @talle`);
    request.params.push({
      name: 'talle',
      type: sql.TinyInt,
      value: Number(talle),
    });
  }

  if (colorId.length > 0) {
    conditions.push(`ColorId = @colorId`);
    request.params.push({
      name: 'colorId',
      type: sql.SmallInt,
      value: Number(colorId),
    });
  }

  if (conditions.length > 0) {
    whereClause += ' AND ' + conditions.join(' AND ');
  }

  if (actual) {
    // JOIN with MACHINES for live data
    baseCTE = `
    WITH Produccion AS (
        SELECT 
            -- Use the first 8 characters of the StyleCode.
            LEFT(COALESCE(pm.StyleCode, m.StyleCode), 8) AS StyleCode,
            COALESCE(SUM(pm.Pieces), 0) + COALESCE(MAX(m.LastpiecesSum), 0) AS Unidades
        FROM PRODUCTIONS_MONITOR pm
        FULL JOIN (
            SELECT StyleCode, SUM(Lastpieces) AS LastpiecesSum
            FROM Machines
            WHERE RoomCode = @room
            GROUP BY StyleCode
        ) m 
        ON pm.StyleCode = m.StyleCode
        WHERE 
            pm.RoomCode = @room
            AND pm.DateRec BETWEEN @prodStartDate AND @prodEndDate
            ${!precise ? `AND LEFT(pm.StyleCode, 8) LIKE @articulo` : ''}
        GROUP BY COALESCE(pm.StyleCode, m.StyleCode)
    )`;
  } else {
    // only PRODUCTIONS_MONITOR
    baseCTE = `
      WITH Produccion AS (
        SELECT 
            LEFT(pm.StyleCode, 8) AS StyleCode,
            SUM(pm.Pieces) AS Unidades
        FROM PRODUCTIONS_MONITOR pm
        WHERE pm.RoomCode = @room
            AND pm.DateRec BETWEEN @prodStartDate AND @prodEndDate
            ${!precise ? `AND LEFT(pm.StyleCode, 8) LIKE @articulo` : ''}
        GROUP BY pm.StyleCode
      )`;
  }

  // Match with APP_COLOR_CODES and return a record per color
  request.query = `
    ${baseCTE}
    ,ProdColorUngrouped AS (
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
        SELECT Articulo, 
               Tipo, 
               Talle, 
               Color, 
               ColorId, 
               Hex, 
               WhiteText, 
               SUM(Unidades) AS Unidades
        FROM ProdColorUngrouped
        WHERE Unidades > 0 ${whereClause}
        GROUP BY Articulo, Tipo, Talle, Color, ColorId, Hex, WhiteText
    )${
      showResults
        ? `
      SELECT *
      FROM ProdColor
      ORDER BY Articulo, Talle, Color;
      `
        : ''
    }`;

  request.params = [
    ...request.params,
    { name: 'room', type: sql.Char(30), value: room },
    {
      name: 'prodStartDate',
      type: sql.VarChar,
      value: startDate,
    },
    {
      name: 'prodEndDate',
      type: sql.VarChar,
      value: endDate,
    },
  ];

  return request;
}

async function runProduccion(
  pool: ConnectionPool,
  ...args: buildArgs
): ProduccionRes {
  const { query, params } = buildProduccion(...args);
  const request = pool.request();
  for (const p of params) {
    request.input(p.name, p.type, p.value);
  }
  return request.query(query);
}

export { buildProduccion, runProduccion };
