// oldProg: Id, Fecha, Articulo, Talle, Docenas
// newProg: articulo, talle, aProducir
const compareProgramada = (oldProg, newProg) => {
  const added = [];
  const modified = [];
  const deleted = [];

  for (const newRow of newProg) {
    const found = oldProg.find(
      (oldRow) =>
        oldRow.Articulo === newRow.articulo && oldRow.Talle === newRow.talle
    );
    if (!found) added.push(newRow);
    else if (found.Docenas !== newRow.aProducir) modified.push(newRow);
  }

  for (const oldRow of oldProg) {
    const found = newProg.find(
      (newRow) =>
        newRow.articulo === oldRow.Articulo && newRow.talle === oldRow.Talle
    );
    if (!found) deleted.push(oldRow);
  }

  return { added, modified, deleted };
};

export { compareProgramada };
