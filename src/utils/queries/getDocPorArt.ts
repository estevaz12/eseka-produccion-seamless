import sql from 'mssql';
import type { ConnectionPool, IResult } from 'mssql';

type DocPorArt = Promise<IResult<{ Articulo: number; DocPorArt: number }>>;

async function getDocPorArt(
  pool: ConnectionPool,
  startDate: string
): DocPorArt {
  return pool.request().input('startDate', sql.VarChar, startDate).query(`
    SELECT p.Articulo, SUM(Docenas) AS DocPorArt
    FROM APP_PROGRAMADA AS p
    WHERE p.Fecha = (SELECT MAX(p2.Fecha)
                      FROM APP_PROGRAMADA AS p2
                      WHERE p2.Articulo = p.Articulo 
                            AND p2.Talle = p.Talle)
          AND p.Fecha >= @startDate 
          AND p.Docenas > 0
	  GROUP BY p.Articulo
  `);
}

export default getDocPorArt;
