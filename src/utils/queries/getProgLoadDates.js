const getProgLoadDates = (room) => {
  return `
    SELECT *
    FROM APP_PROG_LOAD_DATES
    WHERE RoomCode = '${room}'
    ORDER BY Date DESC;
  `;
};

module.exports = getProgLoadDates;
