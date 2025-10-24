import type { ConnectionPool, IResult } from 'mssql';
import sql from 'mssql';

type ArtTipoUpdate = Promise<IResult<any>>;

async function updateArticuloTipo(
  pool: ConnectionPool,
  articulo: number,
  tipo: string | null
): ArtTipoUpdate {
  return pool
    .request()
    .input('articulo', sql.Numeric(7, 2), Number(articulo))
    .input('tipo', sql.Char(1), !tipo || tipo === '' ? null : tipo).query(`
      UPDATE APP_ARTICULOS
      SET Tipo = @tipo
      WHERE Articulo = @articulo;
  `);
}

export default updateArticuloTipo;
