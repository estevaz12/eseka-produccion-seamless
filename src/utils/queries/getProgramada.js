const getProgramada = (startDate) => {
  return `
    SELECT p.*
    FROM SEA_PROGRAMADA AS p
    WHERE p.Fecha = (SELECT MAX(p2.Fecha)
                      FROM SEA_PROGRAMADA AS p2
                      WHERE p2.Articulo = p.Articulo)
          AND p.Fecha >= '${startDate}'
    ORDER BY p.Articulo, p.Talle;
  `;
};

export { getProgramada };
