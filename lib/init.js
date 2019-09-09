const cluster = require('cluster');
const Master = require('./master');
const Worker = require('./worker');
const argv = process.argv || [];
const parent = JSON.parse(argv[2]);
const dir = argv[3];
if (cluster.isMaster) {
  process.title = `[nobita-scripts master] ${argv[0]} ${argv[1]} title=${parent.name}`;
  new Master({ cluster, parent });
} else {
  process.title = `[nobita-scripts worker] ${argv[0]} ${argv[1]} title=${parent.name}`;
  new Worker({ cluster, parent, dir });
}