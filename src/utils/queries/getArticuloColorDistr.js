const getArticuloColorDistr = (articulo) => {
  return `
    SELECT DISTINCT Talle
    FROM SEA_COLOR_DISTR
    WHERE Articulo = ${articulo};
  `;
};

module.exports = getArticuloColorDistr;
