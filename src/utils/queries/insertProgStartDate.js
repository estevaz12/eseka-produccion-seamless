const insertProgStartDate = (data, room = 'SEAMLESS') => {
  return `
    INSERT INTO SEA_PROG_LOAD_DATES (Date, Month, Year, RoomCode)
      VALUES ('${data.date}', ${data.month}, ${data.year}, '${room}');
  `;
};

module.exports = insertProgStartDate;
