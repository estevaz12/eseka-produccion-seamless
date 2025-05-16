const insertDistr = () => {
  let query = '';
  for (const row of distrs) {
    for (let i = 0; i < row.colores.length; i++) {
      const getColorId = `SELECT Id FROM SEA_COLORES WHERE Color = '${row.colores[i]}'`;

      query += `
        INSERT INTO SEA_COLOR_DISTR (Articulo, Color, Porcentaje)
        VALUES (${row.articulo}, (${getColorId}), ${
        row.distr[i] ? row.distr[i] : null
      });
      `;
    }
  }

  return query;
};

export { insertDistr };

const distrs = [
  { articulo: 4891.0, colores: ['CRUDO GRIS'], distr: [1] },
  { articulo: 4893.0, colores: ['CRUDO GRIS'], distr: [1] },
  { articulo: 5172.0, colores: ['CRUDO GRIS'], distr: [1] },
  { articulo: 5173.0, colores: ['CRUDO GRIS'], distr: [1] },
  { articulo: 5320.0, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 5394.0, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 5449.0, colores: ['CORAZONES', 'MARIPOSAS'], distr: [] },
  { articulo: 5533.0, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 5537.1, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 5538.1, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 5539.1, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 5653.0, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 5655.0, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 5718.0, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 5757.0, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 6121.1, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 6123.1, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 6159.0, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 6161.1, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 6163.1, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 6328.0, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 6329.1, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 6333.0, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 6343.0, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 6345.0, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 6346.1, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 6347.1, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 6348.0, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 6349.1, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 6351.1, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 6791.0, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 6793.0, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 6795.0, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 6797.0, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 6797.7, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 7500.0, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 7501.0, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 7502.0, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 7503.0, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 7504.0, colores: ['CRUDO CRUDO'], distr: [1] },
  { articulo: 7505.0, colores: ['CRUDO CRUDO'], distr: [1] },
  {
    articulo: 11731.0,
    colores: [
      'NEGRO GRIS',
      'MELANGE MARINO',
      'MELANGE FRANCIA',
      'MELANGE BORDO',
      'MELANGE VERDE',
      'MELANGE AERO',
    ],
    distr: [1 / 2, (1 / 2 / 6) * 2, 1 / 2 / 6, 1 / 2 / 6, 1 / 2 / 6, 1 / 2 / 6],
  },
  {
    articulo: 11736.0,
    colores: [
      'MELANGE NEGRO',
      'MELANGE MARINO',
      'MELANGE BLANCO',
      'MELANGE GRIS',
    ],
    distr: [0.25, 0.25, 0.25, 0.25],
  },
  {
    articulo: 11737.0,
    colores: [
      'MELANGE NEGRO',
      'MELANGE MARINO',
      'MELANGE FRANCIA',
      'MELANGE BORDO',
      'MELANGE VERDE',
      'MELANGE AERO',
      'MELANGE MELANGE',
    ],
    distr: [
      1 / 2,
      1 / 2 / 6,
      1 / 2 / 6,
      1 / 2 / 6,
      1 / 2 / 6,
      1 / 2 / 6,
      1 / 2 / 6,
    ],
  },
  {
    articulo: 11788.0,
    colores: ['NEGRO BLANCO', 'NEGRO AZUL', 'NEGRO ROJO', 'MELANGE NEGRO'],
    distr: [1 / 3, 1 / 3 / 2, 1 / 3 / 2, 1 / 3],
  },
  {
    articulo: 11789.0,
    colores: ['AZUL ROJO', 'NEGRO FRANCIA', 'NEGRO BLANCO'],
    distr: [1 / 3, 1 / 3, 1 / 3],
  },
  {
    articulo: 11798.0,
    colores: ['MELANGE BLANCO', 'MELANGE NEGRO', 'MELANGE ROJO'],
    distr: [1 / 3, 1 / 3, 1 / 3],
  },
  {
    articulo: 11812.0,
    colores: ['NEGRO BLANCO', 'NEGRO FRANCIA', 'NEGRO ROJO'],
    distr: [1 / 3, 1 / 3, 1 / 3],
  },
  {
    articulo: 11855.0,
    colores: ['MELANGE NEGRO', 'MELANGE FRANCIA', 'MELANGE ROJO'],
    distr: [1 / 3, 1 / 3, 1 / 3],
  },
  { articulo: 11869.0, colores: ['POAL BLANCO'], distr: [1] },
  { articulo: 11881.0, colores: ['CRUDO FRANCIA'], distr: [1] },
  { articulo: 11940.0, colores: ['CRUDO GRIS'], distr: [1] },
  { articulo: 11943.0, colores: ['CRUDO MELANGE'], distr: [1] },
  {
    articulo: 12050.0,
    colores: ['CRUDO GRIS', 'CRUDO NEGRO'],
    distr: [0.75, 0.25],
  },
  {
    articulo: 12056.0,
    colores: ['CRUDO GRIS', 'CRUDO NEGRO'],
    distr: [0.58, 0.42],
  },
  { articulo: 12062.0, colores: ['POAL BLANCO'], distr: [1] },
  { articulo: 12093.0, colores: ['CRUDO GRIS'], distr: [1] },
];
