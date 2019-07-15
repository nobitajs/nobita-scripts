const numCPUs = require('os').cpus().length;
const requireJS = require("nobita-require");
const master = requireJS('./master.js');

class Master {
	constructor(options) {
		this.options = options
		this.pids = [];
		const { I = 1 } = options.parent;
		let workerSucNum = 0;
		if (I == 'max') I = numCPUs;

		options.cluster.on('exit', (worker) => {
			const newWorker = options.cluster.fork();
			this.pids.splice(this.pids.indexOf(worker.process.pid), 1);
			this.pids.push(newWorker.process.pid);
			this.sendAll();
			console.log(`[nobita-scripts] worker pid=${worker.process.pid} is restart ${newWorker.process.pid}`);
		});

		options.cluster.on('message', (worker, data) => {
			workerSucNum++;
			if (workerSucNum == I) {
				console.log(`[nobita-scripts] nobita started on http://127.0.0.1:${data.port}`);
			}
		});

		options.cluster.setupMaster({
			silent: true,
		});

		for (let i = 0; i < I; i++) {
				const worker = options.cluster.fork();
				this.pids.push(worker.process.pid);
				console.log(`[nobita-scripts] Wait Start: ${worker.id}...`);
		}

		this.sendAll();
		typeof master == 'function' && master();
	}

	sendAll() {
		for (let i in this.options.cluster.workers) {
			this.send({
				worder: this.options.cluster.workers[i],
				data: { pids: this.pids }
			});
		}
	}

	send({ worder, data }) {
		worder.send(data);
	}
}

module.exports = Master;