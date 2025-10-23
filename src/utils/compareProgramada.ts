import type { Programada } from '../types';

// newProg: articulo, talle, aProducir
interface NewProgramada {
  readonly articulo: number;
  readonly talle: number;
  readonly aProducir: number;
}

const compareProgramada = (oldProg: Programada[], newProg: NewProgramada[]) => {
  const added: NewProgramada[] = [];
  const modified: NewProgramada[] = [];
  const deleted: NewProgramada[] = [];

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
};

export default compareProgramada;
