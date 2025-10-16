function logQuery(text, params) {
  serverLog('=== SQL QUERY ===');
  serverLog(text.trim());
  serverLog('=== PARAMETERS ===');
  for (const p of params) {
    serverLog(`@${p.name} = ${JSON.stringify(p.value)} (${p.type.name})`);
  }
}

async function runQuery(pool, { text, params }) {
  // Log before execution
  logQuery(text, params);

  const request = pool.request();
  for (const p of params) {
    if (p.value !== undefined && p.value !== null && p.value !== '') {
      request.input(p.name, p.type, p.value);
    }
  }

  return request.query(text);
}

module.exports = {
  logQuery,
  runQuery,
};
