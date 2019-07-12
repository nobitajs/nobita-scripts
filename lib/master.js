const numCPUs = require('os').cpus().length;

const masterInit = (cluster, parent) => {
	const { I = 1 } = parent;
	if (I == 'max') I = numCPUs;

	cluster.on('message', (worker, message) => {
		console.log(message, '-------');
	});

	cluster.on('fork', (worker) => {
		console.log(`工作进程 ${worker.process.pid} 已启动`);

	});

	cluster.on('exit', (worker) => {
		cluster.fork();
		console.log(`工作进程 ${worker.process.pid} 已退出`);
	});

	for (let i = 0; i < I; i++) {
		cluster.fork();
	}

	// console.log(cluster.workers['1'], '-----')
	cluster.workers['1'].send('hi there');
	cluster.workers['2'].send('hi there');
}

module.exports = masterInit;