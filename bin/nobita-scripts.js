#!/usr/bin/env node
const program = require('commander');
const cluster = require('cluster');
const requireJS = require('nobita-require');
const fs = require('fs');
const path = require('path');
const numCPUs = require('os').cpus().length;
const cwd = process.cwd();

program
	.version('0.0.1')
	.option('-i [value]', '进程数')

program
	.command('prod')
	.action(({ parent }) => {
		const { I = 1 } = parent;
		if (I == 'all') I = numCPUs;
		if (cluster.isMaster) {
			for (let i = 0; i < I; i++) {
				cluster.fork();
			}
		} else {
			// const app = require('nobita');
			requireJS('./app.js')
			// console.log(requireJS('./app.js'), '------');
		}
	});

program.parse(process.argv);

