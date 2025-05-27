const getColorId = (articulo, colorCode) => {
  return `
        SELECT DISTINCT c.Id
        FROM SEA_COLORES AS c
          JOIN SEA_COLOR_CODES AS cc 
            ON cc.Color = c.Id
        WHERE cc.Code = '${colorCode}' 
              AND CAST(cc.Articulo AS int) = ${articulo}
      `;
};

export { getColorId };
