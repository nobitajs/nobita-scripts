#!/usr/bin/env node
const program = require('commander');
const cluster = require('cluster');
const { spawn } = require('child_process');
const Master = require('../lib/master.js');
const Worker = require('../lib/worker.js');
const Local = require('../lib/local.js');
const pid = require('../lib/pid.js');
const { findPids, kill } = require('../lib/helper');

program
	.version('0.1.2', '-v, --version')
	.option('-i [value]', '进程数')
	.option('-e [value]', '运行环境')
	.option('-n [value]', '应用名称')
	.option('--ignored [value]', '忽略文件')
	.option('--detached [boolean]', '是否后台运行')

program
	.command('prod [dir]')
	.action((dir, { parent }) => {
		const rawArgs = parent.rawArgs.slice(3);
		spawn('nobita-scripts', ['init', ...rawArgs], {
			cwd: process.cwd(),
			detached: !!parent.detached,
			stdio: !!parent.detached ? 'ignore' : 'inherit'
		});
		!!parent.detached && process.exit();
	});

program
	.command('init [dir]')
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
	.action(async (name) => {
		const pids = await findPids((item) => {
			const cmd = item.cmd;
			return name ?
				cmd.includes('nobita-scripts init') && cmd.includes(`-n ${name}`) :
				cmd.includes('nobita-scripts init');
		});
		kill(pids);
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