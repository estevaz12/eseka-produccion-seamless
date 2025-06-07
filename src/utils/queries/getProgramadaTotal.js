const getProgramadaTotal = (startDate) => {
  return `
    SELECT SUM(Docenas) AS Total
    FROM SEA_PROGRAMADA AS p
    WHERE p.Fecha = (SELECT MAX(p2.Fecha)
          FROM SEA_PROGRAMADA AS p2
          WHERE p2.Articulo = p.Articulo
                AND p2.Talle = p.Talle)
      AND p.Fecha >= '${startDate}'
      AND p.Docenas > 0;
  `;
};

module.exports = getProgramadaTotal;
