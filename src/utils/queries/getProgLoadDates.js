const getProgLoadDates = () => {
  return `
    SELECT *
    FROM SEA_PROG_LOAD_DATES
    WHERE Date != (SELECT TOP (1) Date FROM SEA_PROG_LOAD_DATES ORDER BY Date DESC)
    ORDER BY Date DESC;
  `;
};

module.exports = getProgLoadDates;
