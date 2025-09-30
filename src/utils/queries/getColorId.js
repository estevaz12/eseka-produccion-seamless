const getColorId = (styleCode) => {
  return `
        SELECT DISTINCT c.Id
        FROM COLORES AS c
          JOIN COLOR_CODES AS cc 
            ON cc.Color = c.Id
        WHERE cc.StyleCode = '${styleCode}'
      `;
};

module.exports = getColorId;
