//https://github.com/node-weixin/node-weixin-settings

var sessionConf = {};

export default {
  get: function (id, key, cb) {
    if (sessionConf[id] && sessionConf[id][key]) {
      cb(sessionConf[id][key]);
      return;
    }
    cb(null);
  },
  set: function (id, key, value, cb) {
    if (!sessionConf[id]) {
      sessionConf[id] = {};
    }
    //console.log('set ' + id + 'value: ' + JSON.stringify(value));
    sessionConf[id][key] = value;
    cb();
  },
  all: function (id, cb) {
    if (!sessionConf[id]) {
      sessionConf[id] = {};
    }
    cb(sessionConf[id]);
  }
};