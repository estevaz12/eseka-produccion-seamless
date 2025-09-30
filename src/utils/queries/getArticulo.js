const getArticulo = (articulo) => {
  return `
    SELECT *
    FROM APP_ARTICULOS
    WHERE Articulo = ${articulo};
  `;
};

module.exports = getArticulo;
