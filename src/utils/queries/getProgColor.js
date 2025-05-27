import dayjs from 'dayjs';

const getProgColor = (startDate, includeDeleted = false) => {
  const fecha = startDate.format(process.env.SQL_DATE_FORMAT);
  return `
    SELECT pc.*
    FROM View_Prog_Color AS pc
    WHERE pc.Fecha = (SELECT MAX(pc2.Fecha)
                      FROM View_Prog_Color AS pc2
                      WHERE pc2.Articulo = pc.Articulo 
                            AND pc2.Talle = pc.Talle)
          AND pc.Fecha >= '${fecha}'
          ${includeDeleted ? '' : 'AND pc.Docenas > 0'}
    ORDER BY pc.Articulo, pc.Talle;
  `;
};

export { getProgColor };
