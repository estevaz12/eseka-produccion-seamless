const updateProgColorDoc = (data) => {
  return `
    UPDATE APP_PROG_COLOR
      SET Docenas = ${data.docenas}
      WHERE Programada = ${data.programadaId} 
            AND ColorDistr = ${data.colorDistrId}
    ;`;
};

module.exports = updateProgColorDoc;
