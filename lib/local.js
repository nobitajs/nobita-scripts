const requireJS = require('nobita-require');
const chokidar = require('chokidar');
const Messenger = require('./messenger');

class Local {
  constructor(options) {
    this.options = options;
    const { dir = './app.js' } = options;
    
    const ignored = options.parent.ignored && options.parent.ignored.replace ? options.parent.ignored.replace(/\,/g, '|') : 'node_modules|.git';
    
    
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
    })
  }
}

module.exports = Local;
