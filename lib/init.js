const cluster = require('cluster');
const Master = require('../lib/master');
const Worker = require('../lib/worker');
const parent = JSON.parse(process.argv[2]);
const dir = process.argv[3];
if (cluster.isMaster) {
  process.title = process.title + ' --master';
  new Master({ cluster, parent });
} else {
  process.title = process.title + ' --worker';
  new Worker({ cluster, parent, dir });
}