const child = require('child_process');
const path = require('path');
const echoTable = require('./list');
module.exports = (dir, { parent }) => {
  let args = {};
  const name = parent.N;
  for (var i in parent) {
    if (typeof parent[i] == 'string') {
      args[i] = parent[i];
    }
  }
  process.title = 'master';

  const master = child.fork(path.join(__dirname, '../../lib/init.js'), [JSON.stringify(args), dir], {
    cwd: process.cwd(),
    detached: !!parent.detached,
    stdio: !!parent.detached ? 'ignore' : 'inherit',
    env: process.env
  });

  master.on('message', async (data) => {
    if (data.status) {
      echoTable(name);
      !!parent.detached && process.exit();
    }
  })
}