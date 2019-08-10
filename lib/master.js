const numCPUs = require('os').cpus().length;
const Messenger = require('../lib/messenger.js');
const requireJS = require('nobita-require');
const chalk = require('chalk');
const { findPids, kill, findProcessList, echoTable } = require('../lib/helper');
class Master {
	constructor(options) {
		const master = requireJS('./master.js');
		const { I = 1, N: name } = options.parent;
		this.messenger = new Messenger(options);
		this.options = options;
		this.pids = [];
		this.failTimes = 0;
		this.timer = {};
		this.name = name;
		if (I == 'max') I = numCPUs;

		this.listen(I);
		for (let i = 0; i < I; i++) {
			const worker = options.cluster.fork();
			this.pids.push(worker.process.pid);
			console.log(`[nobita-scripts] Wait Start: ${worker.id}...`);
		}

		this.messenger.broadcast({ action: 'updatePids', pids: this.pids });
		typeof master == 'function' && master(options.cluster);
	}

	listen(I) {
		const cluster = this.options.cluster;
		process.on('SIGINT', () => {
			console.log('[nobita-scripts]');
		});

		cluster.on('exit', (worker, code, signal) => {
			this.exit(worker, code, signal);
		});

		cluster.on('message', (worker, data) => {
			this.message(worker, data);
		});
	}

	async message(worker, data = {}) {
		if (data.port) {
			console.log(`[nobita-scripts] nobita started on http://127.0.0.1:${data.port}`);
		}

		process.send({ status: data.status });
		data.type && this.messenger[data.type] && this.messenger[data.type](data);
	}


	exit(worker, code, signal) {
		const cluster = this.options.cluster;
		const pids = this.pids;
		const time = 3000;
		if (signal == 'SIGINT') {
			console.log(`[nobita-scripts] worker ppid=${process.pid} pid=${worker.process.pid} stop successed!`);
			return;
		}

		this.failTimes++;
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			this.failTimes = 0;
		}, time);

		if (this.failTimes >= 10) {
			console.log(chalk.red('[nobita-scripts] more than 10 failures！'));
			return;
		}

		const newWorker = cluster.fork(process.env);
		pids.splice(pids.indexOf(worker.process.pid), 1);
		pids.push(newWorker.process.pid);
		this.messenger.broadcast({ action: 'updatePids', pids });
		console.log(`[nobita-scripts] worker pid=${worker.process.pid} is restart ${newWorker.process.pid}`);
	}

}

module.exports = Master;