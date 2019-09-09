const events = require('events');
const emitter = new events.EventEmitter();

class Messenger {
  constructor(options) {
    this.options = options;
    options.cluster.on('message', (worker, data) => {
      data.type && this[data.type] && this[data.type](data);
    });
  }

  broadcast(data) {
    const cluster = this.options.cluster;
    for (let i in cluster.workers) {
      this.send({
        worder: cluster.workers[i],
        data
      });
    }
  }

  sendToApp(data) {
    const cluster = this.options.cluster;
    for (let i in cluster.workers) {
      if (cluster.workers[i].process.pid != data.pid) {
        this.send({
          worder: cluster.workers[i],
          data
        });
      }
    }
  }

  sendRandom(data) {
    const cluster = this.options.cluster;
    const keys = Object.keys(cluster.workers);
    const random = Math.floor(Math.random() * keys.length);
    this.send({
      worder: cluster.workers[keys[random]],
      data
    });
  }

  sendTo(data) {
    const cluster = this.options.cluster;
    for (let i in cluster.workers) {
      if (cluster.workers[i].process.pid == data.toPid) {
        this.send({
          worder: cluster.workers[i],
          data
        });
        break;
      }
    }
  }

  send({ worder, data }) {
    data.status = true;
    worder.send(data);
  }

  static init() {
    process.on('message', (res) => {
      res && res.type && res.action && emitter.emit(res.action, res.data);
      if (res.action == 'updatePids') {
        process.pids = res.pids;
      }
    });

    process.messenger = {
      send({ type, action, toPid, data }) {
        process.send({
          type,
          action,
          data,
          pid: process.pid,
          toPid
        })
      },
      on(action, callback) {
        emitter.addListener(action, callback);
      }
    }
  }

}

module.exports = Messenger;