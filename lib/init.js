const cluster = require('cluster');
const Master = require('../lib/master');
const Worker = require('../lib/worker');
const parent = JSON.parse(process.argv[2]);
const dir = process.argv[3];
if (cluster.isMaster) {
  new Master({ cluster, parent });
} else {
  new Worker({ cluster, parent, dir });
}