import { insertProgramada } from './insertProgramada';

// data = {added[Objects], modified[Objects], deleted[Objects]}
const updateProgramada = (data) => {
  let query = '';
  query += insertProgramada(data.added, 'added');
  query += insertProgramada(data.modified, 'modified');
  query += insertProgramada(data.deleted, 'deleted');

  return query;
};

export { updateProgramada };
