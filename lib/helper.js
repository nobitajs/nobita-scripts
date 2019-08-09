const runScript = require('runscript');
const Table = require('word-table');
const isWin = process.platform === 'win32';
const REGEX = isWin ? /^(.*)\s+(\d+)\s*$/ : /^\s*(\d+)\s+(.*)/;
const command = isWin ?
  'wmic Path win32_process Where "Name = \'node.exe\'" Get CommandLine,ProcessId' :
  'ps -e -o pid,args | grep -E "node |iojs |PM2 " | grep -v get_node_processes | grep -v grep';
const command_list = 'ps -e -o pid,user,pcpu,rss,pmem,etime,stat,args | grep -E "node" | grep -v get_node_processes | grep -v grep';

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

exports.findProcessList = async (filterFn) => {
  const stdio = await runScript(command_list, { stdio: 'pipe' });
  const processList = stdio.stdout.toString().split('\n')
    .reduce((arr, line) => {
      if (!!line && !line.includes('/bin/sh') && line.includes('node')) {
        const m = line.split(' ').filter(item => item);

        if (m) {
          const item = { pid: m[0], user: m[1], cpu: m[2], rss: m[3], pmem: m[4], time: m[5], stat: m[6], args: m.slice(7).join(' ') };
          if (!filterFn || filterFn(item)) {
            arr.push(item);
          }
        }
      }
      return arr;
    }, []);

  // const pids = processList.map(x => x.pid);
  return processList;
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

exports.echoTable = (items) => {
  const header = ['App Name', 'pid', 'type', 'uptime', 'cpu', 'mem', 'user'];
  const body = [];
  for (const item of items) {
    const type = item.args.match(/^\[nobita-scripts (\w+)\]/)[1];
    const name = item.args.match(/title=(\w+)/)[1];
    body.push([name, item.pid, type, item.time, item.cpu, (`${(item.rss / 1000).toFixed(1)}MB`), item.user]);
  }
  var table = new Table(header, body);
  console.log(table.string());
}