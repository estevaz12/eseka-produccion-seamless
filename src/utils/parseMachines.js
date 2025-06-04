import { parseStyleCode } from './parseStyleCode.js';

// Machines: [{MachCode, StyleCode: {styleCode, articulo, talle, color, colorId}, ...}]
async function parseMachines(machines) {
  await Promise.all(
    machines.map(async (m) => {
      const parsedStyleCode = await parseStyleCode(m.StyleCode);
      m.StyleCode = { ...parsedStyleCode };
    })
  );
}

export { parseMachines };
