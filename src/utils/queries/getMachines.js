const getMachines = () => {
  /* Machine states
  0: RUN
  2: STOP BUTTON
  3: AUTOMATIC STOP
  4: TARGET
  5: F1
  6: ELECTRÓNICO
  7: MECANICO
  9: HILADO
  13: TURBINA	
  */
  return `
    SELECT MachCode, StyleCode, Pieces, TargetOrder, State
    FROM [dbNautilus].[dbo].[MACHINES]
    WHERE RoomCode = 'SEAMLESS';
  `;
};

export { getMachines };
