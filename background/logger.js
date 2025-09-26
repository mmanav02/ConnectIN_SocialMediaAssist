const buf = [];
const listeners = new Set();

/* prepend timestamp */
const ts = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

export function log (...args)    { add('INFO ', ...args); }
export function warn(...args)    { add('WARN ', ...args); }
export function error(...args)   { add('ERROR', ...args); }

export function downloadLog() {
  const txt  = buf.join('\n') + '\n';
  const data = 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt);

  chrome.downloads.download({
    url      : data,
    filename : `ConnectIN-log-${Date.now()}.txt`,
    saveAs   : true
  });
}

// Allow popup to get whole buffer at once
export function dumpLog() {
  return [...buf];
}

// Allow popup to subscribe for live lines (via Port)
export function addListener(port) {
  listeners.add(port);
  port.onDisconnect.addListener(() => listeners.delete(port));
}

/* internal helper */
// function add(prefix, ...args) {
//   const line = `${ts()}  ${prefix}  ${args.map(a =>
//                  typeof a === 'object' ? JSON.stringify(a) : String(a)
//                ).join(' ')}`;
//   buf.push(line);
//   console[prefix.trim().toLowerCase()](...args);
//   if (buf.length > 5000) buf.shift();
// }

 /* internal helper */
function add(prefix, ...args) {
  const line = `${ts()}  ${prefix}  ${args.map(a =>
    typeof a === 'object' ? JSON.stringify(a) : String(a)
  ).join(' ')}`;

  buf.push(line);
  console[prefix.trim().toLowerCase()](...args);
  if (buf.length > 5000) buf.shift();

  // Broadcast to live listeners
  for (const port of listeners) {
    try { port.postMessage({ type: 'LOG_LINE', line }); } catch { /* ignore */ }
  }
}