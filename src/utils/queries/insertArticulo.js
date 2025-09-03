const insertArticulo = (articulo, tipo) => {
  return `
    INSERT INTO SEA_ARTICULOS (Articulo, Tipo)
     VALUES (${articulo}, ${tipo && tipo !== '' ? `'${tipo}'` : null});\n
  `;
};

module.exports = insertArticulo;
