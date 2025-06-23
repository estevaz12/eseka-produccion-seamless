const getColorId = (styleCode) => {
  return `
        SELECT DISTINCT c.Id
        FROM SEA_COLORES AS c
          JOIN SEA_COLOR_CODES2 AS cc 
            ON cc.Color = c.Id
        WHERE cc.StyleCode = '${styleCode}'
      `;
};

module.exports = getColorId;
