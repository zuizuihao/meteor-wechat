//https://github.com/node-weixin/node-weixin-jssdk
import wechatAuth from "./wechat_auth.js";
import wechatSettings from "./wechat_settings.js";
import utils from './wechat_util.js';

const {mp} = Meteor.settings.private.wechat

WechatJSSDK = {};

const crypto = require('crypto');
const baseUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/';
const TICKET_EXP = 7200 * 1000;
var userAgent = "Meteor";
if (Meteor.release)
  userAgent += "/" + Meteor.release;

/**
 * Prepare a config for jssdk to be enabled in weixin browser
 * @param auth
 * @param app
 * @param url
 * @param cb
 */
WechatJSSDK.prepare = function (url, cb) {
  wechatAuth.determine(mp, function () {
    WechatJSSDK.signify(url, function (error, json) {
      if (!error && !json.errcode) {
        cb(false, {
          appId: mp.id,
          signature: json.signature,
          nonceStr: json.noncestr,
          timestamp: json.timestamp,
          ticket: json.ticket
        });
      } else {
        cb(true, error);
      }
    });
  });
};

/**
   * Get config
   *
   * @param auth
   * @param app
   * @param url
   * @param cb
   */
WechatJSSDK.signify = function (url, cb) {
  this.getTicket(function (error, ticket) {
    if (!error) {
      var config = WechatJSSDK.generate(ticket, url);
      var signature = WechatJSSDK.sign(config);
      config.signature = signature;
      config.ticket = ticket;
      cb(false, config);
    } else {
      cb(true);
    }
  });
}

WechatJSSDK.getTicket = function (cb) {
  wechatSettings.get(mp.id, 'jssdk', function (jssdk) {
    if (!jssdk) {
      jssdk = {};
    }
    jssdk.passed = false;
    var now = new Date().getTime();
    if (jssdk.lastTime && (now - jssdk.lastTime < TICKET_EXP)) {
      jssdk.passed = true;
      cb(false, jssdk.ticket);
      return;
    }
    jssdk.lastTime = now;
    wechatSettings.get(mp.id, 'auth', function (authData) {
      wechatSettings.set(mp.id, 'jssdk', jssdk, function () {
        HTTP.get(baseUrl + 'getticket', {
          params: {
            type: 'jsapi',
            access_token: authData.accessToken
          }
        }, function (error, response) {
          if (error) {
            console.error(response.content);
            cb(true);
            return;
          }
          var json = JSON.parse(response.content);
          jssdk.ticket = json.ticket;
          wechatSettings.set(mp.id, 'jssdk', jssdk, function () {
            cb(false, json.ticket);
          });
        });
      });
    });
  });
}


WechatJSSDK.sign = function (config, type) {
  var str = utils.marshall(config);
  var sha1 = crypto.createHash(type || 'sha1');
  sha1.update(str);
  return sha1.digest('hex');
}

WechatJSSDK.generate = function (ticket, url) {
  var timestamp = String((new Date().getTime() / 1000).toFixed(0));
  var sha1 = crypto.createHash('sha1');
  sha1.update(timestamp);
  var noncestr = sha1.digest('hex');
  return {
    jsapi_ticket: ticket,
    noncestr: noncestr,
    timestamp: timestamp,
    url: url
  };
}

export default WechatJSSDK