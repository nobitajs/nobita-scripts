const cluster = require('cluster');
const Local = require('../local.js');
const Messenger = require('../messenger.js');
const agentInit = require('../agentInit.js');

module.exports = (dir = './app.js', { parent }) => {
  parent = {
    ignored: parent.args[1].ignored,
  };
  const { env = 'local' } = parent;
  if (cluster.isMaster) {
    const messenger = new Messenger({ cluster });
    process.env.RUN_ENV = env;
    let worker = cluster.fork(process.env);
    agentInit(messenger);
    cluster.on('exit', () => {
      worker = cluster.fork();
    });
    messenger.broadcast({ action: 'updatePids', pids: [worker.process.pid] });
  } else {
    new Local({ dir, parent });
  }
}