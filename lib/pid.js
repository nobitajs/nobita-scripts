const path = require('path');
const fs = require('fs');
const pidPath = path.join(__dirname, '../pid.txt');

module.exports = {
  get() {
    let data = {};
    if (fs.existsSync(pidPath)) {
      try {
        data = JSON.parse(fs.readFileSync(pidPath, 'utf8'));
      } catch (e) {
        data = {};
      }
    } else {
      fs.appendFileSync(pidPath, JSON.stringify(data))
    }
    return data;
  },

  set({ title, pid, type }) {
    let data = {};
    data = this.get();
    data[pid] = {
      title
    };

    if (type == 'del') {
      delete data[pid];
    }

    fs.writeFileSync(pidPath, JSON.stringify(data), 'utf8');
  },


  del(pid) {
    this.set({ pid, type: 'del' });
  }
}