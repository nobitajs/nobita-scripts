const requireJS = require('nobita-require');

const workerInit = (cluster, parent) => {
	const { C: main = './app.js' } = parent;
	let app = requireJS(main);
	if (app) {
		app = require('nobita');
	}
}

module.exports = workerInit;
