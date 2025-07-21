const insertArticulo = (data) => {
  return `
    INSERT INTO SEA_ARTICULOS (Articulo, Tipo)
     VALUES (${data.articulo}, ${
    data.tipo && data.tipo !== '' ? `'${data.tipo}'` : null
  });\n
  `;
};

module.exports = insertArticulo;
