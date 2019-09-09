const requireJS = require('nobita-require');
const chokidar = require('chokidar');
const Messenger = require('./messenger');

const { log } = require('./helper');
class Local {
  constructor(options) {
    this.options = options;
    const { dir = './app.js' } = options;
    const { env = 'local' } = options.parent;
    const ignored = options.parent.ignored && options.parent.ignored.replace ? options.parent.ignored.replace(/\,/g, '|') : 'node_modules|.git';
    
    process.env.RUN_ENV = env;
    Messenger.init();
    let app = requireJS(dir);
    if (!app) {
      app = require('nobita');
    }

    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      const chunk = process.stdin.read();
      if (chunk === 'rs\n') {
        process.exit(0);
      }
    });
    chokidar.watch('.', {
      ignored: new RegExp(ignored)
    }).on('change', (path, stats) => {
      process.exit(0);
    }).on('ready', () => {
      log('local start success!')
    });
  }
}

module.exports = Local;
