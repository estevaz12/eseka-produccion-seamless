const getProgLoadDates = () => {
  return `
    SELECT *
    FROM SEA_PROG_LOAD_DATES
    ORDER BY Fecha DESC;
  `;
};

module.exports = getProgLoadDates;
