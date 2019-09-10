const child = require('child_process');
const mkdirp = require('mz-modules/mkdirp');
const path = require('path');
const echoTable = require('./list');
const initPath = path.join(__dirname, '../init.js');
const { error } = require('../helper');

module.exports = async (dir, { parent }) => {
  parent = {
    env: parent.args[1].env,
    instances: parent.args[1].instances,
    name: parent.args[1].name,
    detached: parent.args[1].detached,
  };
  
  process.title = 'init';
  try {
    process.env.NODE_LOG_DIR && await mkdirp(process.env.NODE_LOG_DIR);
  } catch (e) {
    error(`找不到该路径: NODE_LOG_DIR=${process.env.NODE_LOG_DIR}, 请确认启动命令。`);
  }


  const master = child.fork(initPath, [JSON.stringify(parent), dir], {
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