const { findPids } = require('../../lib/helper');

module.exports = async (name) => {
  const pids = await findPids((item) => {
    const cmd = item.cmd;
    return name ?
      cmd.includes(process.cwd()) && cmd.includes(`title=${name}`) :
      cmd.includes('nobita-scripts');
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
}