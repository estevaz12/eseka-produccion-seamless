const getArticuloByStyleCode = (styleCode) => {
  return `
    SELECT Articulo, Talle, Color
    FROM COLOR_CODES
    WHERE StyleCode = '${styleCode}';
  `;
};

module.exports = getArticuloByStyleCode;
