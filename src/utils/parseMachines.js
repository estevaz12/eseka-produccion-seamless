const parseStyleCode = require('./parseStyleCode');

// Machines: [{MachCode, StyleCode: {styleCode, articulo, talle, color, colorId}, ...}]
async function parseMachines(pool, machines) {
  await Promise.all(
    machines.map(async (m) => {
      const parsedStyleCode = await parseStyleCode(
        pool,
        m.RoomCode.trim(),
        m.StyleCode.trim()
      );
      m.StyleCode = { ...parsedStyleCode };
    })
  );
}

module.exports = parseMachines;
