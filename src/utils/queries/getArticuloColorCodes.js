const getArticuloColorCodes = (articulo) => {
  return `
    SELECT *
    FROM COLOR_CODES
    WHERE Articulo = ${articulo};
  `;
};

module.exports = getArticuloColorCodes;
