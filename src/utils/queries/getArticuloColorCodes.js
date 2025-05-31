const getArticuloColorCodes = (articulo) => {
  return `
    SELECT *
    FROM SEA_COLOR_CODES
    WHERE Articulo = ${articulo};
  `;
};

export { getArticuloColorCodes };
