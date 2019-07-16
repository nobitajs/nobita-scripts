class Messenger {
  constructor(options) {
    this.options = options;
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
    worder.send(data);
  }

}

module.exports = Messenger;