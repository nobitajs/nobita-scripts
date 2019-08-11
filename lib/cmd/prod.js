const child = require('child_process');
const path = require('path');
const echoTable = require('./list');
const initPath = path.join(__dirname, '../../lib/init.js');
const { error } = require('../helper');

module.exports = (dir, { parent }) => {
  let args = {};
  for (var i in parent) {
    if (typeof parent[i] == 'string') {
      args[i] = parent[i];
    }
  }
  process.title = 'master';

  const master = child.fork(initPath, [JSON.stringify(args), dir], {
    cwd: process.cwd(),
    detached: !!parent.detached,
    stdio: !!parent.detached ? 'ignore' : 'inherit',
    env: process.env
  });

  master.on('message', (data) => {
    data.status ? echoTable(parent.name, () => {
      !!parent.detached && process.exit();
    }) : error(data.error);
  })
}