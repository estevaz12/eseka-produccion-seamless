const insertProgramada = require('./insertProgramada');

// data = {added[Objects], modified[Objects], deleted[Objects]}
const updateProgramada = (room, data, date) => {
  let query = '';
  // data.added should technically be empty, but in case it isn't
  query += insertProgramada(data.added, room, 'inserted', date);
  query += insertProgramada(data.modified, room, 'inserted', date);
  query += insertProgramada(data.deleted, room, 'deleted', date);

  return query;
};

module.exports = updateProgramada;
