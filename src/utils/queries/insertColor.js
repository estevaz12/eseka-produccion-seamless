const insertColor = (data) => {
  return `
    INSERT INTO APP_COLORES (Color)
      VALUES ('${data.color}');
  `;
};

module.exports = insertColor;
