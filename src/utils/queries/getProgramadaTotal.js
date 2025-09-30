const getProgramadaTotal = (room, startDate) => {
  return `
    SELECT SUM(Docenas) AS Total
    FROM PROGRAMADA AS p
    WHERE p.Fecha = (SELECT MAX(p2.Fecha)
          FROM PROGRAMADA AS p2
          WHERE p2.Articulo = p.Articulo
                AND p2.Talle = p.Talle)
          AND p.RoomCode = '${room}'
      AND p.Fecha >= '${startDate}'
      AND p.Docenas > 0;
  `;
};

module.exports = getProgramadaTotal;
