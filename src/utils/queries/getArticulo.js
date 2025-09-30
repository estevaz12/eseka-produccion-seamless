const getArticulo = (articulo) => {
  return `
    SELECT *
    FROM ARTICULOS
    WHERE Articulo = ${articulo};
  `;
};

module.exports = getArticulo;
