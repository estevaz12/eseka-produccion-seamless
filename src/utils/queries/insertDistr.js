const insertDistr = (articulo, talle, colorDistr) => {
  return `
    INSERT INTO SEA_COLOR_DISTR (Articulo, Talle, Color, Porcentaje)
    VALUES (${articulo}, ${talle}, ${colorDistr.color}, ${
    colorDistr.porcentaje && colorDistr.porcentaje !== '0'
      ? colorDistr.porcentaje
      : null
  });\n
  `;
};

module.exports = insertDistr;
