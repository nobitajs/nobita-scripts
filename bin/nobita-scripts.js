#!/usr/bin/env node
const program = require('commander');
const cluster = require('cluster');
const { spawn, fork } = require('child_process');
const path = require('path');
const Local = require('../lib/local.js');
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
		let args = {};
		for (var i in parent) {
			if (typeof parent[i] == 'string') {
				args[i] = parent[i];
			}
		}
		process.title = 'master';
		fork(path.join(__dirname, '../lib/init.js'), [JSON.stringify(args), dir], {
			cwd: process.cwd(),
			detached: !!parent.detached,
			stdio: !!parent.detached ? 'ignore' : 'inherit',
			env: process.env
		});
		!!parent.detached && process.exit();
	});


program
	.command('stop [name]')
	.action(async (name) => {
		const pids = await findPids((item) => {
			const cmd = item.cmd;
			return name ?
				cmd.includes(process.cwd()) && cmd.includes(`"N":"${name}"`) :
				cmd.includes('nobita-scripts');
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