const getCurrArtColorDistr = (articulo) => {
  return `
    SELECT *
    FROM SEA_COLOR_DISTR AS cd1
    WHERE cd1.Articulo = ${articulo}
      AND cd1.Vigencia = (SELECT MAX(cd2.Vigencia)
                          FROM SEA_COLOR_DISTR AS cd2
                          WHERE cd2.Articulo = cd1.Articulo)
    ORDER BY cd1.Porcentaje DESC;
  `;
};

module.exports = getCurrArtColorDistr;
