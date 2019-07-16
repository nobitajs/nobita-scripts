const numCPUs = require('os').cpus().length;
const pid = require('../lib/pid.js');
const Messenger = require('../lib/messenger.js');


class Master {
	constructor(options) {
		this.messenger = new Messenger(options);
		this.options = options;
		this.pids = [];
		const { I = 1, silent } = options.parent;

		if (I == 'max') I = numCPUs;

		this.listen(I);

		options.cluster.setupMaster({
			silent: silent == 'false' ? false : true,
		});

		for (let i = 0; i < I; i++) {
			const worker = options.cluster.fork();
			this.pids.push(worker.process.pid);
			console.log(`[nobita-scripts] Wait Start: ${worker.id}...`);
		}

		this.messenger.broadcast({ action: 'updatePids', pids: this.pids });
		typeof master == 'function' && master();
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
			pid.del(process.pid)
			return;
		}
		const newWorker = cluster.fork();
		pids.splice(pids.indexOf(worker.process.pid), 1);
		pids.push(newWorker.process.pid);
		this.messenger.broadcast({ action: 'updatePids', pids });
		console.log(`[nobita-scripts] worker pid=${worker.process.pid} is restart ${newWorker.process.pid}`);
	}

}

module.exports = Master;