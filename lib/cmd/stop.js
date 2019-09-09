const { log, filter, findPids } = require('../helper');

module.exports = async (name) => {
  console.log(name)
  const pids = await findPids((item) => {
    const cmd = item.cmd.trim();
    return filter(cmd, name);
  });

  pids.forEach(pid => {
    try {
      process.kill(pid, 'SIGKILL');
    } catch (err) {
      if (err.code !== 'ESRCH') {
        throw err;
      }
    }
  });
  pids.length ? log('stop successed !', pids) : log('nothing stop App!');

}