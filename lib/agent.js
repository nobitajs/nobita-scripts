
const readdir = require('nobita-readdir');
const requireJS = require('nobita-require');
const Schedule = require('node-schedule');
const scheduleDir = readdir('./app/schedule');
const Messenger = require('./messenger');

if (process.env.RUN_ENV != 'local') {
  const argv = process.argv || [];
  const parent = JSON.parse(argv[2]);
  process.title = `[nobita-scripts agent] ${argv[0]} ${argv[1]} title=${parent.name}`;
}

Messenger.init();

scheduleDir.forEach(async path => {
  const { schedule = {} } = requireJS(path);
  Schedule.scheduleJob(schedule.cron, () => {
    if (!schedule.env || schedule.env && schedule.env.includes(process.env.RUN_ENV)) {
      process.messenger.send({
        action: 'nobita-schedule',
        type: schedule.type == 'all' ? 'broadcast' : 'sendRandom',
        data: { path }
      });
    }
  });
})



