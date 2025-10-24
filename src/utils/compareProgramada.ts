import type { CompareProgData, PDFProgRow, Programada } from '../types';

// newProg: articulo, talle, aProducir
function compareProgramada(
  oldProg: Programada[],
  newProg: PDFProgRow[]
): CompareProgData {
  const added: PDFProgRow[] = [];
  const modified: PDFProgRow[] = [];
  const deleted: PDFProgRow[] = [];

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
    if (!found && oldRow.Docenas > 0)
      deleted.push({
        articulo: oldRow.Articulo,
        talle: oldRow.Talle,
        aProducir: oldRow.Docenas,
      });
  }

  return { added, modified, deleted };
}

export default compareProgramada;
