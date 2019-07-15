const requireJS = require('nobita-require');


class Worker {
	constructor(options) {
		this.options = options;
		const { C: main = './app.js', E: env = 'prod', N: title } = options.parent;
		process.env.RUN_ENV = env;
		process.on('message', (data) => {
			process.pids = data.pids;
		});
		let app = requireJS(main);
		if (app) {
			app = require('nobita');
		}

		process.title = title || process.title;
		process.env.PORT = app.config.listen.port;
		process.send({ port: app.config.listen.port });

	}
}

module.exports = Worker;
