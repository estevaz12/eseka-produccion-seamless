const getCurrWEff = () => {
  // faster to filter and sort on the server
  return `
    SELECT *
    FROM Weff_Actual_Monitor 
  `;
};

module.exports = getCurrWEff;
