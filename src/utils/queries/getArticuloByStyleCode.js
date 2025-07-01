const getArticuloByStyleCode = (styleCode) => {
  return `
    SELECT Articulo, Color
    FROM SEA_COLOR_CODES
    WHERE StyleCode = '${styleCode}';
  `;
};

module.exports = getArticuloByStyleCode;
