import sql from 'mssql';
import type { ConnectionPool, IResult } from 'mssql';
import type { ColorDistr } from '../../types';

type ColorDistrTalle = Promise<IResult<Pick<ColorDistr, 'Talle'>>>;

async function getArticuloColorDistr(
  pool: ConnectionPool,
  articulo: number
): ColorDistrTalle {
  return pool.request().input('articulo', sql.Numeric(7, 2), Number(articulo))
    .query(`
    SELECT DISTINCT Talle
    FROM APP_COLOR_DISTR
    WHERE Articulo = @articulo;
  `);
}

export default getArticuloColorDistr;
