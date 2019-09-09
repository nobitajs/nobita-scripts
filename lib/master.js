const numCPUs = require('os').cpus().length;
const Messenger = require('./messenger.js');
const requireJS = require('nobita-require');
const { log } = require('./helper');
class Master {
	constructor(options) {
		const master = requireJS('./master.js');
		const { instances = 1, name } = options.parent;
		this.sucInit = 0;
		this.messenger = new Messenger(options);
		this.options = options;
		this.pids = {};
		this.failTimes = 0;
		this.timer = {};
		this.name = name;
		this.instances = instances == 'max' ? numCPUs : instances;
		this.listen();
		for (let i = 0; i < this.instances; i++) {
			const worker = options.cluster.fork();
			this.pids[i] = worker.process.pid;
			log(`Wait Start: ${worker.id}...`);
		}

		this.messenger.broadcast({ action: 'updatePids', pids: this.pids });
		typeof master == 'function' && master(options.cluster);
	}

	listen() {
		let sucInit = 0;
		let lock = false;
		const timeouts = [];
		const cluster = this.options.cluster;
		process.on('SIGINT', () => {
			log('master exit!');
		});

		cluster.on('exit', (worker, code, signal) => {
			this.exit(worker, code, signal);
		});

		cluster.on('listening', (worker) => {
			sucInit++;
			if (sucInit >= this.instances && !lock) {
				lock = true;
				process.send({ status: true, env: process.env });
				clearTimeout(timeouts[worker.id]);
			}
		});

		cluster.on('message', (worker, data) => {
			this.message(worker, data);
		});
	}

  message(worker, data = {}) {
		if (data.port) {
			log(`nobita started on http://127.0.0.1:${data.port}`);
		}
		if (!data.status) {
			this.failTimes++;
			clearTimeout(this.timer);
			this.timer = setTimeout(() => { this.failTimes = 0; }, 1000);
			if (this.failTimes > 9) {
				process.send(data);
				process.exit();
			}
		}
	}


	exit(worker, code, signal) {
		const cluster = this.options.cluster;
		const pids = this.pids;
		if (signal == 'SIGINT') {
			log(`worker ppid=${process.pid} pid=${worker.process.pid} stop successed !`);
			return;
		}

		const newWorker = cluster.fork();
		for (const i in pids) {
			if (pids[i] == worker.process.pid) {
				pids[i] = newWorker.process.pid;
			}
		}

		this.messenger.broadcast({ action: 'updatePids', pids });
		log(`worker pid=${worker.process.pid} is restart ${newWorker.process.pid}`);
	}

}

module.exports = Master;