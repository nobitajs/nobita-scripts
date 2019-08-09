const numCPUs = require('os').cpus().length;
const Messenger = require('../lib/messenger.js');
const requireJS = require('nobita-require');

class Master {
	constructor(options) {
		const master = requireJS('./master.js');
		this.messenger = new Messenger(options);
		this.options = options;
		this.pids = [];
		const { I = 1 } = options.parent;

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

		cluster.on('exit', (worker, code, signal) => { this.exit(worker, code, signal); });
		cluster.on('message', (worker, data) => { this.message(worker, data); });
	}

	message(worker, data) {
		if (data.port) {
			console.log(`[nobita-scripts] nobita started on http://127.0.0.1:${data.port}`);
		}
		data.type && this.messenger[data.type] && this.messenger[data.type](data);
	}


	exit(worker, code, signal) {
		const cluster = this.options.cluster;
		const pids = this.pids;
		if (signal == 'SIGINT') {
			console.log(`[nobita-scripts] worker ppid=${process.pid} pid=${worker.process.pid} stop successed!`);
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