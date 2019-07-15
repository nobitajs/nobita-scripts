const numCPUs = require('os').cpus().length;
const pid = require('../lib/pid.js');

class Master {
	constructor(options) {
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

		this.sendAll();
		typeof master == 'function' && master();
	}

	listen(I){
		let workerSucNum = 0;
		const cluster = this.options.cluster;
		const pids = this.pids;

		process.on('SIGINT', () => {
			console.log('Got SIGINT.  Press Control-D to exit.');
		});
		cluster.on('exit', (worker, code, signal) => {
			if(signal == 'SIGINT'){
				console.log(`[nobita-scripts] worker ppid=${process.pid} pid=${worker.process.pid} stop successed!`);
				pid.del(process.pid)
				return;
			}
			const newWorker = cluster.fork();
			pids.splice(pids.indexOf(worker.process.pid), 1);
			pids.push(newWorker.process.pid);
			this.sendAll();
			console.log(`[nobita-scripts] worker pid=${worker.process.pid} is restart ${newWorker.process.pid}`);
		});

		cluster.on('message', (worker, data) => {
			workerSucNum++;
			if (workerSucNum == I) {
				console.log(`[nobita-scripts] start successed!`);
				if (data.port) {
					console.log(`[nobita-scripts] nobita started on http://127.0.0.1:${data.port}`);
				}
			}
		});
	}

	sendAll() {
		const cluster = this.options.cluster;
		for (let i in cluster.workers) {
			this.send({
				worder: cluster.workers[i],
				data: { pids: this.pids }
			});
		}
	}

	send({ worder, data }) {
		worder.send(data);
	}
}

module.exports = Master;