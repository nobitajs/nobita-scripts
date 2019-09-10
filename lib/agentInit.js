const path = require('path');
const child = require('child_process');
const initAgent = path.join(__dirname, './agent.js');

const argv = process.argv.slice(2);
module.exports = (messenger) => {
  let agent = child.fork(initAgent, argv, {
    cwd: process.cwd(),
    env: process.env,
  });

  agent.on('message', (data) => {
    data.type && messenger[data.type] && messenger[data.type](data);
  });
}