const insertProgStartDate = (data) => {
  return `
    INSERT INTO SEA_PROG_LOAD_DATES (Date, Month, Year)
      VALUES ('${data.date}', ${data.month}, ${data.year});
  `;
};

module.exports = insertProgStartDate;
