import type { ConnectionPool } from 'mssql';
import type { SQLQueryOpts, SQLQueryParam } from '../types';
import serverLog from './serverLog.ts';

function logQuery(query: string, params: SQLQueryParam[]) {
  serverLog('=== SQL QUERY ===');
  serverLog(query.trim());
  serverLog('=== PARAMETERS ===');
  for (const p of params) {
    serverLog(`@${p.name} = ${JSON.stringify(p.value)} (${p.type})`);
  }
}

async function runQuery(
  pool: ConnectionPool,
  { query, params }: SQLQueryOpts,
  log = false
) {
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

export { logQuery, runQuery };
