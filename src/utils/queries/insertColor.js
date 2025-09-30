const insertColor = (data) => {
  return `
    INSERT INTO COLORES (Color)
      VALUES ('${data.color}');
  `;
};

module.exports = insertColor;
