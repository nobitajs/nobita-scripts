const requireJS = require('nobita-require');


class Worker {
	constructor(options) {
		this.options = options;
		const { E: env = 'prod', N: title = 'app' } = options.parent;
		const { dir = './app.js' } = options;
		process.env.RUN_ENV = env;
		process.on('message', (data) => {
			process.pids = data.pids;
		});

		let app = requireJS(dir);

		if (!app) {
			app = require('nobita');
			process.env.PORT = app.config.listen.port;
			process.send({ port: app.config.listen.port });
		}

		process.title = title || process.title;
		process.send({ status: true })
	}
}

module.exports = Worker;
