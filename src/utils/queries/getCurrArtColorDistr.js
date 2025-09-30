const getCurrArtColorDistr = (articulo, talle) => {
  return `
    SELECT *
    FROM APP_COLOR_DISTR AS cd1 
    WHERE cd1.Articulo = ${articulo}
      ${talle ? `AND cd1.Talle = ${talle}` : ''}
      AND cd1.Vigencia = (SELECT MAX(cd2.Vigencia)
                          FROM APP_COLOR_DISTR AS cd2
                          WHERE cd2.Articulo = cd1.Articulo 
                                ${talle ? `AND cd2.Talle = cd1.Talle` : ''})
    ORDER BY cd1.Porcentaje DESC;
  `;
};

module.exports = getCurrArtColorDistr;
