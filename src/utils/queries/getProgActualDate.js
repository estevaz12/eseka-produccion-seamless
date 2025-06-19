const getProgActualDate = () => {
  return `
    SELECT TOP (1) *
    FROM SEA_PROG_LOAD_DATES
    ORDER BY Date DESC;
  `;
};

module.exports = getProgActualDate;
