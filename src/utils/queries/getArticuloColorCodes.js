const getArticuloColorCodes = (articulo) => {
  return `
    SELECT *
    FROM SEA_COLOR_CODES2
    WHERE Articulo = ${articulo};
  `;
};

module.exports = getArticuloColorCodes;
