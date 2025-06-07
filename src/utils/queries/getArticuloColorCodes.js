const getArticuloColorCodes = (articulo) => {
  return `
    SELECT *
    FROM SEA_COLOR_CODES
    WHERE Articulo = ${articulo};
  `;
};

module.exports = getArticuloColorCodes;
