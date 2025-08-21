const getDailyWEff = (room) => {
  return `
    SELECT ProdDate, RoomCode, WorkEfficiency 
    FROM WEff_Diario
    WHERE RoomCode = '${room}' AND WorkEfficiency > 0
    ORDER BY ProdDate
  `;
};

module.exports = getDailyWEff;
