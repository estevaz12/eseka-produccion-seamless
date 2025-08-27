function calcEff(room, data) {
  // filter by room first
  const roomData = data.filter((row) => row.RoomCode.startsWith(room));
  // then calculate efficiency by group
  let totalDivisor = 0;
  let totalDividend = 0;
  let groups = roomData.reduce((acc, row) => {
    const wEff =
      row.WorkEfficiency > 100 ? row.TimeEfficiency : row.WorkEfficiency;
    const groupCode =
      room === 'SEAMLESS' ? seamlessGroups[row.MachCode] : row.GroupCode;

    const divisor = wEff * (row.TimeOn + row.TimeOff);
    const dividend = row.TimeOn + row.TimeOff;

    totalDivisor += divisor;
    totalDividend += dividend;

    if (acc[groupCode]) {
      acc[groupCode].divisor += divisor;
      acc[groupCode].dividend += dividend;
    } else {
      acc[groupCode] = {
        divisor: divisor,
        dividend: dividend,
      };
    }

    return acc;
  }, {});

  groups = Object.keys(groups).map((groupCode) => {
    const { divisor, dividend } = groups[groupCode];

    if (dividend > 0) {
      // calculate total room efficiency
      return {
        GroupCode: groupCode,
        GroupEff: Math.round(divisor / dividend),
      };
    } else return { GroupCode: groupCode, GroupEff: 0 };
  });

  return {
    groups: groups.sort((a, b) => a.GroupCode.localeCompare(b.GroupCode)),
    total: Math.round(totalDivisor / totalDividend),
  };
}

module.exports = calcEff;

const seamlessGroups = {
  1001: '1001-1030',
  1002: '1001-1030',
  1003: '1001-1030',
  1004: '1001-1030',
  1005: '1001-1030',
  1006: '1001-1030',
  1007: '1001-1030',
  1008: '1001-1030',
  1009: '1001-1030',
  1010: '1001-1030',
  1011: '1001-1030',
  1012: '1001-1030',
  1013: '1001-1030',
  1014: '1001-1030',
  1015: '1001-1030',
  1016: '1001-1030',
  1017: '1001-1030',
  1018: '1001-1030',
  1019: '1001-1030',
  1020: '1001-1030',
  1021: '1001-1030',
  1022: '1001-1030',
  1023: '1001-1030',
  1024: '1001-1030',
  1025: '1001-1030',
  1026: '1001-1030',
  1027: '1001-1030',
  1028: '1001-1030',
  1029: '1001-1030',
  1030: '1001-1030',
  1031: '1031-1037',
  1032: '1031-1037',
  1033: '1031-1037',
  1034: '1031-1037',
  1035: '1031-1037',
  1036: '1031-1037',
  1037: '1031-1037',
};
