const insertProgramada = require('./insertProgramada');

// data = {added[Objects], modified[Objects], deleted[Objects]}
const updateProgramada = (data, date) => {
  let query = '';
  // data.added should technically be empty, but in case it isn't
  query += insertProgramada(data.added, 'inserted', date);
  query += insertProgramada(data.modified, 'inserted', date);
  query += insertProgramada(data.deleted, 'deleted', date);

  return query;
};

module.exports = updateProgramada;
