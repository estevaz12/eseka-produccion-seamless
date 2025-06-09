const dayjs = require('dayjs');
const produccion = require('./produccion');
const getDocPorArt = require('./getDocPorArt');

const getProgColorTable = (startDate) => {
  // get Month Production
  const monthProd = produccion(
    'SEAMLESS',
    dayjs()
      .startOf('month')
      .add(6, 'hour')
      .add(1, 'second')
      .format(process.env.SQL_DATE_FORMAT),
    dayjs().format(process.env.SQL_DATE_FORMAT),
    true,
    '',
    '',
    '',
    false
  );
  // get Docenas por Articulo
  const docPorArt = getDocPorArt(startDate);

  // monthProd query already has WITH clause
  return `
    ${monthProd}
    ,DocPorArt AS (
      ${docPorArt}
    )
    SELECT pc.*, d.DocPorArt, COALESCE(p.Unidades, 0) AS Producido
    FROM View_Prog_Color AS pc
      JOIN DocPorArt AS d
        ON d.Articulo = pc.Articulo
      LEFT JOIN ProdColor as p
        ON p.Articulo = pc.Articulo 
           AND p.Talle = pc.Talle 
           AND p.ColorId = pc.ColorId
    WHERE pc.Fecha = (SELECT MAX(pc2.Fecha)
                      FROM View_Prog_Color AS pc2
                      WHERE pc2.Articulo = pc.Articulo 
                            AND pc2.Talle = pc.Talle)
          AND pc.Fecha >= '${startDate}' 
          AND pc.DocProg > 0
    ORDER BY pc.Articulo, pc.Talle, pc.Porcentaje DESC, pc.Color;
  `;
};

module.exports = getProgColorTable;
