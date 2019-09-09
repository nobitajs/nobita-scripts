const cluster = require('cluster');
const Local = require('../local.js');
const Messenger = require('../messenger.js');

module.exports = (dir = './app.js', { parent }) => {

  if (cluster.isMaster) {
    const messenger = new Messenger({ cluster });
    let worker = cluster.fork();

    cluster.on('exit', () => {
      worker = cluster.fork();
    });
    messenger.broadcast({ action: 'updatePids', pids: [worker.process.pid] });
  } else {
    new Local({ dir, parent });
  }
}