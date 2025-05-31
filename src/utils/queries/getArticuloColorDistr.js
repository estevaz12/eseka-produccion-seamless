const getArticuloColorDistr = (articulo) => {
  return `
    SELECT *
    FROM SEA_COLOR_DISTR
    WHERE Articulo = ${articulo};
  `;
};

export { getArticuloColorDistr };
