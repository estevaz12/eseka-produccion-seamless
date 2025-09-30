const getArticuloColorDistr = (articulo) => {
  return `
    SELECT DISTINCT Talle
    FROM COLOR_DISTR
    WHERE Articulo = ${articulo};
  `;
};

module.exports = getArticuloColorDistr;
