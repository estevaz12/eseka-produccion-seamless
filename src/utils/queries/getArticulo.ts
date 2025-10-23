import type { ConnectionPool, IResult } from 'mssql';
import type { Articulo } from '../../types';
import sql from 'mssql';

async function getArticulo(
  pool: ConnectionPool,
  articulo: number | string
): Promise<IResult<Articulo>> {
  return pool.request().input('articulo', sql.Numeric(7, 2), Number(articulo))
    .query(`
    SELECT *
    FROM APP_ARTICULOS
    WHERE Articulo = @articulo;
  `);
}

export default getArticulo;
