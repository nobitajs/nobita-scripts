const requireJS = require('nobita-require');
const Messenger = require('./messenger');

class Worker {
	constructor(options) {
		this.options = options;
		const { env = 'prod', name = 'app' } = options.parent;
		const { dir = './app.js' } = options;
		this.action = {};
		process.env.RUN_ENV = env;
		process.name = name || process.name;
		Messenger.init();
		process.on('uncaughtException', (error) => {
			process.send({ status: false, error: error.stack })
			process.exit();
		});

		process.on('message', (res) => {
			if(res.action == 'updatePids'){
				let app = requireJS(dir);
				if (!app) {
					app = require('nobita');
					process.env.PORT = app.config.listen.port;
					process.send({ port: app.config.listen.port });
				}
			}
		});
	}

}

module.exports = Worker;
