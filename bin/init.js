const requireJS = require("nobita-require");
const app = requireJS('./app.js');
const Nobita = require('nobita');
typeof app == 'function' && app(Nobita);