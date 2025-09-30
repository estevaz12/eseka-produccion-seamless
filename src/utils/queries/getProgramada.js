const getProgramada = (room, startDate) => {
  return `
    SELECT p.*
    FROM PROGRAMADA AS p
    WHERE p.Fecha = (SELECT MAX(p2.Fecha)
                      FROM PROGRAMADA AS p2
                      WHERE p2.Articulo = p.Articulo 
                            AND p2.Talle = p.Talle)
          AND p.Fecha >= '${startDate}'
          AND p.RoomCode = '${room}'
          --AND p.Docenas > 0
    ORDER BY p.Articulo, p.Talle;
  `;
};

module.exports = getProgramada;
