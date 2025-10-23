import sql from 'mssql';
import type { ConnectionPool, IResult } from 'mssql';
import type { Room } from '../../types';

type Cambios = Promise<IResult<any>>;

async function getCambios(
  pool: ConnectionPool,
  startDate: string,
  room: Room
): Cambios {
  return pool
    .request()
    .input('roomCode', sql.Char(30), room)
    .input('startDate', sql.VarChar, startDate).query(`
    DECLARE @room CHAR(30) = @roomCode;

    DECLARE @fechaInicio DATE = @startDate;

    DECLARE @fechaFin DATE = DATEADD(day, 1, @fechaInicio);

    DECLARE @HORA TIME = '06:00:00';

    DECLARE @fechaHoraInicio DATETIME = CAST(@fechaInicio AS DATETIME) + CAST(@HORA AS DATETIME);

    DECLARE @fechaHoraFin DATETIME = CAST(@fechaFin AS DATETIME) + CAST(@HORA AS DATETIME);

    WITH Ordenado AS (
        SELECT
            MachCode,
            Shift,
            STYLECODE AS anterior,
            STYLECODE AS actual,
            DATEREC,
            ROW_NUMBER() OVER (PARTITION BY MachCode ORDER BY DATEREC) AS fila
        FROM PRODUCTIONS_MONITOR
        WHERE DATEREC BETWEEN @fechaHoraInicio AND @fechaHoraFin
          AND RoomCode = @room
    ),
    Comparacion AS (
        SELECT
            a.MachCode,
            a.DateRec AS date_anterior,
            a.Shift AS shift_anterior,
            a.anterior,
            b.actual,
            b.Shift AS shift_actual,
            b.DateRec AS date_actual
        FROM Ordenado a
        JOIN Ordenado b
          ON a.fila + 1 = b.fila
        AND a.MachCode = b.MachCode
    ),
    Produccion AS (
        SELECT
            Shift,
            MachCode,
            StyleCode,
            SUM(Pieces) AS produccion
        FROM PRODUCTIONS_MONITOR
        WHERE DateRec BETWEEN DATEADD(second, 1, @fechaHoraInicio) AND @fechaHoraFin
        GROUP BY Shift, MachCode, StyleCode
    ),
    Cambios AS (
        SELECT 
            comp.shift_actual AS Shift,
            comp.MachCode,
            comp.actual AS StyleCode,
            prod_actual.produccion AS Unidades,
            comp.date_actual,
            ROW_NUMBER() OVER (
                PARTITION BY comp.MachCode, comp.shift_actual
                ORDER BY comp.date_actual DESC
            ) AS rn
        FROM Comparacion comp
        LEFT JOIN Produccion prod_actual
          ON comp.MachCode = prod_actual.MachCode
        AND comp.shift_actual = prod_actual.Shift
        AND comp.actual = prod_actual.StyleCode
        WHERE comp.anterior <> comp.actual
    )
    SELECT
        Shift,
        MachCode,
        cc.Articulo,
        art.Tipo,
        cc.Talle,
        cc.Color as ColorId,
        colors.Color,
        colors.Hex,
        colors.WhiteText,
        Unidades,
        date_actual as DateRec
    FROM Cambios as c
      JOIN APP_COLOR_CODES AS cc
        ON cc.StyleCode = LEFT(c.StyleCode, 8)
      JOIN APP_ARTICULOS AS art
        ON art.Articulo = cc.Articulo
      JOIN APP_COLORES AS colors
        ON colors.Id = cc.Color
    WHERE rn = 1
    ORDER BY Shift, MachCode;
  `);
}

export default getCambios;
