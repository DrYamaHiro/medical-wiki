/**
 * Overview Booster — UXログ収集 (client-only、localStorage、サーバ送信なし)
 */

const UX_LOG_KEY = 'ob_ux_log_v1';
const MAX_EVENTS = 1000;

export function recordEvent(eventType, metadata = {}) {
  if (typeof window === 'undefined') return;
  try {
    const log = JSON.parse(window.localStorage.getItem(UX_LOG_KEY) || '[]');
    log.push({ ts: Date.now(), type: eventType, ...metadata });
    while (log.length > MAX_EVENTS) log.shift();
    window.localStorage.setItem(UX_LOG_KEY, JSON.stringify(log));
  } catch {}
}

export function getEventLog() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(UX_LOG_KEY) || '[]');
  } catch {
    return [];
  }
}

export function clearEventLog() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(UX_LOG_KEY);
  } catch {}
}
