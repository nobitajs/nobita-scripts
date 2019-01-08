#!/usr/bin/env node
const program = require('commander');
const shell = require("shelljs");
const path = require('path');
const fs = require('fs');
const pwd = process.cwd();
const isExists = fs.existsSync(path.resolve(pwd, './.watchignore'));
let ignore = '';

if (isExists) {
	let arr = fs.readFileSync(path.resolve(pwd, './.watchignore'), 'utf8');
	arr = arr.split('\n');
	arr = [...new Set(arr)];
	for (const i in arr) {
		if (arr[i]) {
			ignore += `--ignore ${arr[i]} `;
		}
	}
}

program
	.version('0.0.1')
	.option('-e [value]', '错误日志')
	.option('-o [value]', '输出日志')
	.option('-n [value]', '程序名字')
	.option('-i [value]', '进程数')

program
	.command('local')
	.action(() => {
		shell.exec(`cross-env RUN_ENV=local nodemon ${__dirname}/init.js ${ignore}`);
	});

program
	.command('prod')
	.action(({ parent }) => {
		const { E, O, N, I } = parent;
		const e = E ? `-e ${E} ` : `-e ./logs/app-err.log `;
		const o = O ? `-o ${O} ` : `-o ./logs/app-out.log `;
		const n = N ? `-n ${N} ` : `-n nobita `;
		const i = I ? `-i ${I} ` : `-i 1 `;
		const str = e + o + n + i;
		shell.exec(`cross-env RUN_ENV=prod pm2 start ${__dirname}/init.js ${str}`);
	});

program
	.command('stop')
	.action(() => {
		shell.exec(`cross-env RUN_ENV=prod pm2 stop ${__dirname}/init.js`);
	});

program
	.command('restart')
	.action(() => {
		shell.exec(`cross-env RUN_ENV=prod pm2 restart ${__dirname}/init.js`);
	});

program
	.command('debug')
	.action(() => {
		shell.exec("cross-env RUN_ENV=local node --inspect app.js");
	});


program.parse(process.argv);

