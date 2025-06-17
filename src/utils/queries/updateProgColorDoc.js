const updateProgColorDoc = (data) => {
  return `
    UPDATE SEA_PROG_COLOR
      SET Docenas = ${data.docenas}
      WHERE Programada = ${data.programadaId} 
            AND ColorDistr = ${data.colorDistrId}
    ;`;
};

module.exports = updateProgColorDoc;
