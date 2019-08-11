const Table = require('word-table');
const { findProcessList, filter } = require('../helper');

module.exports = async (name, callback) => {
  const header = ['App Name', 'pid', 'type', 'uptime', 'cpu', 'mem', 'user'];
  const body = [];
  const items = await findProcessList((item) => {
    const cmd = item.args.trim();
    return filter(cmd, name);
  });

  for (const item of items) {
    const type = item.args.match(/^\[nobita-scripts (\w+)\]/)[1];
    const name = item.args.match(/title=(\w+)/)[1];
    body.push([name, item.pid, type, item.time, item.cpu, (`${(item.rss / 1000).toFixed(1)}MB`), item.user]);
  }
  var table = new Table(header, body);
  console.log(table.string());
  typeof callback == 'function' && callback();
}