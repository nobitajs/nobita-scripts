const requireJS = require('nobita-require');
const events = require('events');
const emitter = new events.EventEmitter();

class Worker {
	constructor(options) {
		this.options = options;
		const { env = 'prod', name = 'app' } = options.parent;
		const { dir = './app.js' } = options;
		this.action = {};
		process.env.RUN_ENV = env;
		process.name = name || process.name;
		process.messenger = {
			send: this.send,
			on: this.on
		}
		process.on('uncaughtException', (error) => {
			process.send({ status: false, error: error.stack })
			process.exit();
		});
		process.on('message', (res) => {
			res && res.type && res.action && emitter.emit(res.action, res.data);
			res.action == 'updatePids' && this.updatePids(res.pids)
		});

		let app = requireJS(dir);

		if (!app) {
			app = require('nobita');
			process.env.PORT = app.config.listen.port;
			process.send({ port: app.config.listen.port });
		}

	}

	updatePids(pids) {
		process.pids = pids;
	}

	send({ type, action, toPid, data }) {
		process.send({
			type,
			action,
			data,
			pid: process.pid,
			toPid
		})
	}

	on(action, callback) {
		emitter.addListener(action, callback);
	}

}

module.exports = Worker;
