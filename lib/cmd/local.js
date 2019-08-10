const cluster = require('cluster');
const Local = require('../../lib/local.js');

module.exports = (dir = './app.js', { parent }) => {
  if (cluster.isMaster) {
    let worker = cluster.fork();
    cluster.on('exit', () => {
      worker = cluster.fork();
    });
  } else {
    new Local({ dir, parent });
  }
}