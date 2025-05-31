const getArticulo = (articulo) => {
  return `
    SELECT *
    FROM SEA_ARTICULOS
    WHERE Articulo = ${articulo};
  `;
};

export { getArticulo };
