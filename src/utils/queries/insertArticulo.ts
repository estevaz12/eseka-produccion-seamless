import type { ConnectionPool, IResult } from 'mssql';
import type { Programada, Room } from '../../types';
import sql from 'mssql';

type ArticuloInsert = Promise<IResult<any>>;

async function insertArticulo(
  pool: ConnectionPool,
  articulo: number,
  tipo: string | null
): ArticuloInsert {
  return pool
    .request()
    .input('articulo', sql.Numeric(7, 2), Number(articulo))
    .input('tipo', sql.Char(1), tipo && tipo !== '' ? tipo : null).query(`
      INSERT INTO APP_ARTICULOS (Articulo, Tipo)
       VALUES (@articulo, @tipo);\n
  `);
}

export default insertArticulo;
