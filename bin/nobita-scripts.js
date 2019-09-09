#!/usr/bin/env node
const commander = require('commander');

commander
	.version('0.3.3', '-v, --version')

commander
	.command('start [dir]')
	.option('-i --instances [value]', '进程数')
	.option('-e --env [value]', '运行环境')
	.option('-n --name [value]', '应用名称')
	.option('-d --detached [boolean]', '是否后台运行')
	.description('以本地生产模式启动应用')
	.action(require('../lib/cmd/start'));

commander
	.command('stop [name]')
	.description('停止应用')
	.action(require('../lib/cmd/stop'));

commander
	.command('local [dir]')
	.option('--ignored [value]', '忽略文件')
	.description('以本地开发模式启动应用')
	.action(require('../lib/cmd/local'))

commander
	.command('list [name]')
	.description('查看应用列表')
	.action(require('../lib/cmd/list'))

commander.parse(process.argv);