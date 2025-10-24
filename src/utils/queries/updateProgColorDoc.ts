import type { ConnectionPool, IResult } from 'mssql';
import type { ProgColorDocData } from '../../types';
import sql from 'mssql';

type ProgColorDocUpdate = Promise<IResult<any>>;

async function updateProgColorDoc(
  pool: ConnectionPool,
  data: ProgColorDocData
): ProgColorDocUpdate {
  return pool
    .request()
    .input('docenas', sql.Decimal(7, 2), Number(data.docenas))
    .input('programadaId', sql.Int, Number(data.programadaId))
    .input('colorDistrId', sql.SmallInt, Number(data.colorDistrId)).query(`
      UPDATE APP_PROG_COLOR
      SET Docenas = @docenas
      WHERE Programada = @programadaId 
            AND ColorDistr = @colorDistrId
    ;`);
}

export default updateProgColorDoc;
