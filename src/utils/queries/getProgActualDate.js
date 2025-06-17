const getProgActualDate = () => {
  return `
    SELECT TOP (1) *
    FROM SEA_PROG_LOAD_DATE
    ORDER BY Fecha DESC;
  `;
};

module.exports = getProgActualDate;
