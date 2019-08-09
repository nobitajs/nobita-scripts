const runScript = require('runscript');
const isWin = process.platform === 'win32';
const REGEX = isWin ? /^(.*)\s+(\d+)\s*$/ : /^\s*(\d+)\s+(.*)/;
const command = isWin ?
  'wmic Path win32_process Where "Name = \'node.exe\'" Get CommandLine,ProcessId' :
  'ps -eo "pid,args"';
  
exports.kill = (pids) => {
  pids.forEach(pid => {
    try {
      process.kill(pid, 'SIGKILL');
    } catch (err) {
      if (err.code !== 'ESRCH') {
        throw err;
      }
    }
  });
}

exports.findPids = async (filterFn) => {
  const stdio = await runScript(command, { stdio: 'pipe' });
  const processList = stdio.stdout.toString().split('\n')
    .reduce((arr, line) => {
      if (!!line && !line.includes('/bin/sh') && line.includes('node')) {
        const m = line.match(REGEX);
        if (m) {
          const item = isWin ? { pid: m[2], cmd: m[1] } : { pid: m[1], cmd: m[2] };
          if (!filterFn || filterFn(item)) {
            arr.push(item);
          }
        }
      }
      return arr;
    }, []);

  const pids = processList.map(x => x.pid);
  return pids;
}