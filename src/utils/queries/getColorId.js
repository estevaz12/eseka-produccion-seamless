const getColorId = (styleCode) => {
  return `
        SELECT DISTINCT c.Id
        FROM APP_COLORES AS c
          JOIN APP_COLOR_CODES AS cc 
            ON cc.Color = c.Id
        WHERE cc.StyleCode = '${styleCode}'
      `;
};

module.exports = getColorId;
