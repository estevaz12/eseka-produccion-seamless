import type { ConnectionPool, IResult } from 'mssql';
import type { ColorDistrData } from '../../types';
import sql from 'mssql';

type DistrInsert = Promise<IResult<any>>;

async function insertDistr(
  pool: ConnectionPool,
  articulo: number,
  talle: number,
  colorDistr: ColorDistrData
): DistrInsert {
  return pool
    .request()
    .input('articulo', sql.Numeric(7, 2), Number(articulo))
    .input('talle', sql.TinyInt, Number(talle))
    .input('color', sql.SmallInt, Number(colorDistr.color))
    .input(
      'porcentaje',
      sql.Float,
      colorDistr.porcentaje && colorDistr.porcentaje !== '0'
        ? Number(colorDistr.porcentaje)
        : null
    ).query(`
    INSERT INTO APP_COLOR_DISTR (Articulo, Talle, Color, Porcentaje)
    VALUES (@articulo, @talle, @color, @porcentaje);\n
  `);
}

export default insertDistr;
