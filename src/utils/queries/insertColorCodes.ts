import sql from 'mssql';
import serverLog from '../serverLog.ts';
import getArticulo from './getArticulo.ts';
import type { ConnectionPool, IResult } from 'mssql';
import type { Articulo, ColorCodeData } from '../../types';

type ColorCodeInsert = Promise<IResult<any>>;

async function insertColorCodes(
  pool: ConnectionPool,
  data: ColorCodeData
): ColorCodeInsert {
  let query = '';
  // For proper parsing and comparing
  const punto = !data.punto || data.punto === '' ? 0 : data.punto;
  const tipo = !data.tipo || data.tipo === '' ? null : data.tipo;

  let articulo: Articulo[] = [];
  try {
    // Check if articulo exists
    const res = await getArticulo(pool, `${data.articulo}.${punto}`);
    articulo = res.recordset;

    let articuloAction = '';
    if (articulo.length === 0) {
      // If articulo does not exist, insert it
      articuloAction = `
        INSERT INTO APP_ARTICULOS (Articulo, Tipo)
          VALUES (@articulo, @tipo);`;
    } else if (articulo[0].Tipo !== data.tipo) {
      // If articulo exists but Tipo is different, update it
      articuloAction = `
        UPDATE APP_ARTICULOS
        SET Tipo = @tipo
        WHERE Articulo = @articulo;`;
    }

    query += `
      ${articuloAction}        
  
      INSERT INTO APP_COLOR_CODES (Articulo, Color, Code, Talle, StyleCode)
        VALUES (@articulo, @color, @code, @talle, @styleCode);\n 
    `;
  } catch (err) {
    serverLog(
      `[ERROR] /colorCodes/insert: Error fetching art. ${data.articulo}.${punto}: ${err.message}`
    );
  }

  return pool
    .request()
    .input('articulo', sql.Numeric(7, 2), Number(`${data.articulo}.${punto}`))
    .input('tipo', sql.Char(1), tipo)
    .input('color', sql.SmallInt, Number(data.color))
    .input('code', sql.Char(2), data.code)
    .input('talle', sql.TinyInt, Number(data.talle))
    .input('styleCode', sql.Char(8), data.styleCode)
    .query(query);
}

export default insertColorCodes;
