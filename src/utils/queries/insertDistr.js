const insertDistr = (articulo, colorDistr) => {
  return `
    INSERT INTO SEA_COLOR_DISTR (Articulo, Color, Porcentaje)
    VALUES (${articulo}, ${colorDistr.color}, ${
    colorDistr.porcentaje && colorDistr.porcentaje !== '0'
      ? colorDistr.porcentaje
      : null
  });\n
  `;
};

module.exports = insertDistr;
