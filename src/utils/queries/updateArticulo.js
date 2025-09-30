const updateArticuloTipo = (articulo, tipo) => {
  return `
    UPDATE ARTICULOS
    SET Tipo = ${!tipo || tipo === '' ? null : `'${tipo}'`}
    WHERE Articulo = ${articulo};
  `;
};

module.exports = updateArticuloTipo;
