const getArticuloByStyleCode = (styleCode) => {
  return `
    SELECT Articulo, Talle, Color
    FROM APP_COLOR_CODES
    WHERE StyleCode = '${styleCode}';
  `;
};

module.exports = getArticuloByStyleCode;
