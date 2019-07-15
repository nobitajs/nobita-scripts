#!/usr/bin/env node
const program = require('commander');
const cluster = require('cluster');
const Master = require('../lib/master.js');
const Worker = require('../lib/worker.js');
const path = require('path');
const fs = require('fs');
const pidPath = path.join(__dirname, '../pid.txt');
program
	.version('0.0.4', '-v, --version')
	.option('-i [value]', '进程数')
	.option('-c [value]', '入口文件路径')
	.option('-e [value]', '运行环境')
	.option('-n [value]', '应用名称')


program
	.command('prod')
	.action(({ parent }) => {
		if (cluster.isMaster) {
			if (fs.existsSync(pidPath)) {
				fs.writeFile(pidPath, process.pid, 'utf8', (err) => err && console.log(err));
			} else {
				fs.appendFileSync(pidPath, process.pid)
			}
			new Master({ cluster, parent });
		} else {
			new Worker({ cluster, parent });
		}
	});

program
	.command('stop')
	.action(({ parent }) => {
		console.log('[nobita-scripts] stopping nobita application');
		const pid = parseInt(fs.readFileSync(path.join(__dirname, '../pid.txt'), 'utf8'));
		if (pid && pid > 0) {
			process.kill(pid, 'SIGHUP');
		}
	});


program.parse(process.argv);




