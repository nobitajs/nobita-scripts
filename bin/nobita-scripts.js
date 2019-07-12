#!/usr/bin/env node
const program = require('commander');
const cluster = require('cluster');
const masterInit = require('../lib/master.js');
const workerInit = require('../lib/worker.js');

program
	.version('0.0.3')
	.option('-i [value]', '进程数')
	.option('-c [value]', '入口文件路径')

program
	.command('prod')
	.action(({ parent }) => {
		if (cluster.isMaster) {
			masterInit(cluster, parent);
		} else {
			workerInit(cluster, parent);
		}
	});

program.parse(process.argv);




