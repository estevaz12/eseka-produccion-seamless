const getArticuloColorCodes = (articulo) => {
  return `
    SELECT *
    FROM APP_COLOR_CODES
    WHERE Articulo = ${articulo};
  `;
};

module.exports = getArticuloColorCodes;
