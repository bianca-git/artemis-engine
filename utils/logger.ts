// Minimal structured logger wrapper for consistency.
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function log(level: LogLevel, msg: string, meta?: Record<string, any>) {
  const payload = { ts: new Date().toISOString(), level, msg, ...meta };
  // eslint-disable-next-line no-console
  console[level === 'error' ? 'error' : 'log'](JSON.stringify(payload));
}

export const logger = {
  info: (msg: string, meta?: Record<string, any>) => log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, any>) => log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, any>) => log('error', msg, meta),
  debug: (msg: string, meta?: Record<string, any>) => log('debug', msg, meta),
};
