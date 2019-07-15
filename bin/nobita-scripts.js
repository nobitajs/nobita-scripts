#!/usr/bin/env node
const program = require('commander');
const cluster = require('cluster');
const Master = require('../lib/master.js');
const Worker = require('../lib/worker.js');
const pid = require('../lib/pid.js');

program
	.version('0.0.6', '-v, --version')
	.option('-i [value]', '进程数')
	.option('-e [value]', '运行环境')
	.option('-n [value]', '应用名称')
	.option('--silent [boolean]', '是否输出到控制台')


program
	.command('prod <dir>')
	.action((dir, { parent }) => {
		const { N: title = 'app' } = parent;
		if (cluster.isMaster) {
			pid.set({ title, pid: process.pid })
			new Master({ cluster, parent });

		} else {
			new Worker({ cluster, parent, dir });
		}
	});

program
	.command('stop <name>')
	.action((name) => {
		console.log(`[nobita-scripts] stopping nobita application name=${name}`);
		let data = pid.get();
		for (let id in data) {
			if (data[id].title == name) {
				pid.del(id);
				try {
					process.kill(id, 'SIGHUP');
				} catch (error) {

				}

			}
		}

	});

program.parse(process.argv);




