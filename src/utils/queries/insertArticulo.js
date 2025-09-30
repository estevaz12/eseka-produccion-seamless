const insertArticulo = (articulo, tipo) => {
  return `
    INSERT INTO ARTICULOS (Articulo, Tipo)
     VALUES (${articulo}, ${tipo && tipo !== '' ? `'${tipo}'` : null});\n
  `;
};

module.exports = insertArticulo;
