const cluster = require('cluster');
const Master = require('../lib/master');
const Worker = require('../lib/worker');
const parent = JSON.parse(process.argv[2]);
const dir = process.argv[3];
let argv = process.argv || [];
if (cluster.isMaster) {
  process.title = '[nobita-scripts master]' + argv.join(' ');
  new Master({ cluster, parent });
} else {
  process.title = '[nobita-scripts worker]' + argv.join(' ');
  new Worker({ cluster, parent, dir });
}