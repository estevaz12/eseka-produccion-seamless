const serverLog = require('./serverLog');

function logQuery(query, params) {
  serverLog('=== SQL QUERY ===');
  serverLog(query.trim());
  serverLog('=== PARAMETERS ===');
  for (const p of params) {
    serverLog(`@${p.name} = ${JSON.stringify(p.value)} (${p.type.name})`);
  }
}

async function runQuery(pool, { query, params }, log = false) {
  // Log before execution
  if (log) logQuery(query, params);

  const request = pool.request();
  for (const p of params) {
    if (p.value !== undefined && p.value !== null && p.value !== '') {
      request.input(p.name, p.type, p.value);
    }
  }

  return request.query(query);
}

module.exports = {
  logQuery,
  runQuery,
};
