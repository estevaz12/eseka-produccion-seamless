const insertColor = (data) => {
  return `
    INSERT INTO SEA_COLORES (Color)
      VALUES ('${data.color}');
  `;
};

module.exports = insertColor;
