const child = require('child_process');
const path = require('path');
const echoTable = require('./list');
const initPath = path.join(__dirname, '../../lib/init.js');
const mkdirp = require('mz-modules/mkdirp');
const { error } = require('../helper');

module.exports = async (dir, { parent }) => {
  let args = {};
  for (var i in parent) {
    if (typeof parent[i] == 'string') {
      args[i] = parent[i];
    }
  }
  process.title = 'init';
  try {
    await mkdirp(process.env.NODE_LOG_DIR);
  } catch (e) {
    error(`找不到该路径: NODE_LOG_DIR=${process.env.NODE_LOG_DIR}, 请确认启动命令。`);
  }


  const master = child.fork(initPath, [JSON.stringify(args), dir], {
    cwd: process.cwd(),
    detached: !!parent.detached,
    stdio: !!parent.detached ? 'ignore' : 'inherit',
  });
  master.on('message', (data) => {
    data.status ? echoTable(parent.name, () => {
      !!parent.detached && process.exit();
    }) : error(data.error);
  })
}