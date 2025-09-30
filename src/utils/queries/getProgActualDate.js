const getProgActualDate = (room) => {
  return `
    SELECT TOP (1) *
    FROM PROG_LOAD_DATES
    WHERE RoomCode = '${room}'
    ORDER BY Date DESC;
  `;
};

module.exports = getProgActualDate;
