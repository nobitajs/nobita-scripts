#!/usr/bin/env node
const program = require('commander');

program
	.version('0.2.2', '-v, --version')
	.option('-i [value]', '进程数')
	.option('-e [value]', '运行环境')
	.option('-n [value]', '应用名称')
	.option('--ignored [value]', '忽略文件')
	.option('--detached [boolean]', '是否后台运行')

program
	.command('prod [dir]')
	.action(require('../lib/cmd/prod'));

program
	.command('stop [name]')
	.action(require('../lib/cmd/stop'));

program
	.command('local [dir]')
	.action(require('../lib/cmd/local'))

program
	.command('list [name]')
	.action(require('../lib/cmd/list'))

program.parse(process.argv);