#!/usr/bin/env node
const program = require('commander');
const cluster = require('cluster');
const Master = require('../lib/master.js');
const Worker = require('../lib/worker.js');
const Local = require('../lib/local.js');
const pid = require('../lib/pid.js');


program
	.version('0.1.0', '-v, --version')
	.option('-i [value]', '进程数')
	.option('-e [value]', '运行环境')
	.option('-n [value]', '应用名称')
	.option('--silent [boolean]', '是否输出到控制台')
	.option('--ignored [value]', '忽略文件')

program
	.command('prod [dir]')
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
	.command('stop [name]')
	.action((name) => {
		console.log(`[nobita-scripts] stopping nobita application name=${name}`);
		let data = pid.get();
		for (let id in data) {
			if (data[id].title == name || !name) {
				pid.del(id);
				try {
					process.kill(id, 'SIGHUP');
				} catch (error) {
				}
			}
		}
	});

program
	.command('local [dir]')
	.action((dir = './app.js', { parent }) => {
		if (cluster.isMaster) {
			let worker = cluster.fork();
			cluster.on('exit', () => {
				worker = cluster.fork();
			});
		} else {
			new Local({ dir, parent });
		}
	})

program.parse(process.argv);