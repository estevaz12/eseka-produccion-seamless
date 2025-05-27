import { insertProgramada } from './insertProgramada';

// data = {added[Objects], modified[Objects], deleted[Objects]}
const updateProgramada = (data, date) => {
  let query = '';
  query += insertProgramada(data.added, 'added', date);
  query += insertProgramada(data.modified, 'modified', date);
  query += insertProgramada(data.deleted, 'deleted', date);

  return query;
};

export { updateProgramada };
