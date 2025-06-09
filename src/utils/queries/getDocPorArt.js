const getDocPorArt = (startDate) => {
  return `
    SELECT p.Articulo, SUM(Docenas) AS DocPorArt
    FROM SEA_PROGRAMADA AS p
    WHERE p.Fecha = (SELECT MAX(p2.Fecha)
                      FROM SEA_PROGRAMADA AS p2
                      WHERE p2.Articulo = p.Articulo 
                            AND p2.Talle = p.Talle)
          AND p.Fecha >= '${startDate}' 
          AND p.Docenas > 0
	  GROUP BY p.Articulo
  `;
};

module.exports = getDocPorArt;
