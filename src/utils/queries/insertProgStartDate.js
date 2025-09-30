const insertProgStartDate = (data, room) => {
  return `
    INSERT INTO PROG_LOAD_DATES (Date, Month, Year, RoomCode)
      VALUES ('${data.date}', ${data.month}, ${data.year}, '${room}');
  `;
};

module.exports = insertProgStartDate;
