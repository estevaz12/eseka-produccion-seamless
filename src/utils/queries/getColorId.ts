import sql from 'mssql';
import type { ConnectionPool, IResult } from 'mssql';
import type { Color } from '../../types';

type ColorId = Promise<IResult<Pick<Color, 'Id'>>>;

async function getColorId(pool: ConnectionPool, styleCode: string): ColorId {
  return pool.request().input('styleCode', sql.Char(8), styleCode).query(`
      SELECT DISTINCT c.Id
      FROM APP_COLORES AS c
        JOIN APP_COLOR_CODES AS cc 
          ON cc.Color = c.Id
      WHERE cc.StyleCode = @styleCode
    `);
}

export default getColorId;
