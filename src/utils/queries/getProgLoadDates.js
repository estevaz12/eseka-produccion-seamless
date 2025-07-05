const getProgLoadDates = () => {
  return `
    SELECT *
    FROM SEA_PROG_LOAD_DATES
    ORDER BY Date DESC;
  `;
};

module.exports = getProgLoadDates;
