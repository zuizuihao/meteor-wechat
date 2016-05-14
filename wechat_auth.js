//https://github.com/node-weixin/node-weixin-auth
const crypto = require('crypto');
import wechatSettings from "./wechat_settings.js";

export default {
  ACCESS_TOKEN_EXP: 7200 * 1000,
  generateSignature: function (token, timestamp, nonce) {
    var mixes = [token, timestamp, nonce];
    mixes.sort();
    var str = mixes.join('');
    var sha1 = crypto.createHash('sha1');
    sha1.update(str);
    return sha1.digest('hex');
  },
  check: function (token, signature, timestamp, nonce) {
    var newSignature = this.generateSignature(token, timestamp, nonce);
    if (newSignature === signature) {
      return true;
    }
    return false;
  },
  determine: function (app, cb) {
    var self = this;
    wechatSettings.get(app.id, 'auth', function (auth) {
      var now = new Date().getTime();
      if (!auth) {
        auth = {};
      }

      if (auth.lastTime && ((now - auth.lastTime) < self.ACCESS_TOKEN_EXP)) {
        cb(true);
        return;
      }
      auth.lastTime = now;
      wechatSettings.set(app.id, 'auth', auth, function () {
        self.tokenize(app, cb);
      });
    });
  },
  tokenize: function (app, cb) {
    HTTP.get('https://api.weixin.qq.com/cgi-bin/token', {
      params: {
        grant_type: 'client_credential',
        appid: app.id,
        secret: app.secret
      }
    }, function (error, response) {
      if (error) {
        cb(error, response.content);
        return;
      }
      var json = JSON.parse(response.content);
      wechatSettings.get(app.id, 'auth', function (auth) {
        if (!auth) {
          auth = {};
        }
        auth.accessToken = json.access_token;
        wechatSettings.set(app.id, 'auth', auth, cb);
      });
    });
  }
};