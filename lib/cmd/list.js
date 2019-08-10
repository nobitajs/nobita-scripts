const Table = require('word-table');
const {findProcessList} = require('../helper');

module.exports = async (name) => {
  const header = ['App Name', 'pid', 'type', 'uptime', 'cpu', 'mem', 'user'];
  const body = [];
  const items = await findProcessList((item) => {
    const args = item.args;
    return name ?
      args.includes('nobita-scripts') && args.includes('init.js') && args.includes(`title=${name}`) :
      args.includes('nobita-scripts') && args.includes('init.js');
  });
  
  for (const item of items) {
    const type = item.args.match(/^\[nobita-scripts (\w+)\]/)[1];
    const name = item.args.match(/title=(\w+)/)[1];
    body.push([name, item.pid, type, item.time, item.cpu, (`${(item.rss / 1000).toFixed(1)}MB`), item.user]);
  }
  var table = new Table(header, body);
  console.log(table.string());
}