const insertProgramada = require('./insertProgramada');

// data = {added[Objects], modified[Objects], deleted[Objects]}
const updateProgramada = async (pool, room, data, date) => {
  // data.added should technically be empty, but in case it isn't
  await insertProgramada(pool, data.added, room, 'inserted', date);
  await insertProgramada(pool, data.modified, room, 'inserted', date);
  await insertProgramada(pool, data.deleted, room, 'deleted', date);
};

module.exports = updateProgramada;
