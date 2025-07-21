const updateArticuloTipo = (articulo, tipo) => {
  return `
    UPDATE SEA_ARTICULOS
    SET Tipo = ${!tipo || tipo === '' ? null : `'${tipo}'`}
    WHERE Articulo = ${articulo};
  `;
};

module.exports = updateArticuloTipo;
