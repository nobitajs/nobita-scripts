const requireJS = require('nobita-require');
const chokidar = require('chokidar');

class Local {
  constructor(options) {
    this.options = options;
    const { E: env = 'prod', N: title = 'app' } = options.parent;
    const { dir = './app.js' } = options;
    let app = requireJS(dir);
    if (!app) {
      app = require('nobita');
    }
    chokidar.watch('.', {
      ignored: /node_modules|.git/
    }).on('change', (path, stats) => {
      process.exit(0);
    }).on('ready',() => {
      console.log('[nobita-scripts] local start success!')
    });
  }
}

module.exports = Local;
