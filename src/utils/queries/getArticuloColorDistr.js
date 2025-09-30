const getArticuloColorDistr = (articulo) => {
  return `
    SELECT DISTINCT Talle
    FROM APP_COLOR_DISTR
    WHERE Articulo = ${articulo};
  `;
};

module.exports = getArticuloColorDistr;
