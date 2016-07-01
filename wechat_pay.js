// https://github.com/node-weixin/node-weixin-pay
import wechatAuth from './wechat_auth.js'
import wechatSettings from './wechat_settings.js'
import utils from './wechat_util.js'
import wechatRequest from './wechat_request.js'

var xml = require('xml')

const config = Meteor.settings.private.wechat_mp
if (!config) {
  console.log('error', 'Please Add wechat_open setting.')
}

WechatPay = {}

const crypto = require('crypto')
const baseUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/'
const TICKET_EXP = 7200 * 1000
var userAgent = 'Meteor'
if (Meteor.release)
  userAgent += '/' + Meteor.release

WechatPay.init = function (pfx) {
  config.certificate = {
    pfx: pfx,
    pfxKey: config.merchant.id
  }
}

WechatPay.unified = function (data, callback) {
  data.device_info = 'WEB'
  data.trade_type = 'JSAPI'

  pay.request('https://api.mch.weixin.qq.com/pay/unifiedorder', data, (error, result) => {
      if (error) {
        if (callback)
          callback(error, result)
        return
      }
      var ret = pay.prepay(config.app, config.merchant, result.prepay_id);
      if (callback)
          callback(null, ret)
    })
}

WechatPay.query = function (data, cb) {
  var url = 'https://api.mch.weixin.qq.com/pay/orderquery'
  pay.request(url, data, cb)
}

WechatPay.close = function (data, cb) {
  var url = 'https://api.mch.weixin.qq.com/pay/closeorder'
  pay.request(url, data, cb)
}

WechatPay.createRefund = function (data, cb) {
  var url = 'https://api.mch.weixin.qq.com/secapi/pay/refund'
  pay.request(url, data, cb)
}

WechatPay.queryRefund = function (data, cb) {
  var url = 'https://api.mch.weixin.qq.com/pay/refundquery'
  pay.request(url, data, cb)
}

WechatPay.statements = function (data, cb) {
  var url = 'https://api.mch.weixin.qq.com/pay/downloadbill'
  pay.request(url, data, cb)
}

WechatPay.report = function (data, cb) {
  var url = 'https://api.mch.weixin.qq.com/payitil/report'
  pay.request(url, data, cb)
}

var pay = {
  /**
   * Basic http request wrapper for pay apis, which need to be encrypted and verified for their data format
   *
   * @param url                 Requesting url
   * @param data                Data to be sent
   * @param sendConfig          Sending data validation configuration
   * @param receiveConfig       Receiving data validation configuration
   * @param certificate         Certificate from Tencent Pay
   * @param cb                  Callback Function
   */
  request: function (url, data, cb) {
    var error = {}

    var params = _.clone(data)
    params = pay.prepare(config.app, config.merchant, params);
    var sign = pay.sign(config.merchant, params)
    params.sign = sign
    var xml = utils.toXml(params)
    wechatRequest.xmlssl(url, xml, config.certificate, cb)
  },

  /**
   * Prepare data with normal fields
   *
   * @param data
   * @param app
   * @param merchant
   * @param device
   * @returns {*}
   */
  prepare: function (app, merchant, data, device) {
    data.appid = app.id
    /* eslint camelcase: [2, {properties: "never"}] */
    data.mch_id = merchant.id
    if (device) {
      data.device_info = device.info
    }
    data.nonce_str = utils.getNonce()
    return data
  },

  /**
   * Sign all data with merchant key
   *
   * @param merchant
   * @param params
   * @returns {string}
   */
  sign: function (merchant, params) {
    var temp = utils.marshall(params)
    temp += '&key=' + String(merchant.key)
    temp = new Buffer(temp)
    temp = temp.toString('binary')
    var crypt = crypto.createHash('MD5')
    crypt.update(temp)
    return crypt.digest('hex').toUpperCase()
  },

  /**
   *  Make prepay data for jssdk
   *
   * @param app
   * @param merchant
   * @param prepayId
   * @returns {{appId: *, timeStamp: string, nonceStr, packagee: string, signType: string}}
   */
  prepay: function (app, merchant, prepayId) {
    var crypto = require('crypto')
    var md5 = crypto.createHash('md5')
    var timeStamp = String(new Date().getTime())

    md5.update(timeStamp)
    timeStamp = Math.floor(timeStamp / 1000)

    var nonceStr = md5.digest('hex')
    var data = {
      appId: app.id,
      timeStamp: String(timeStamp),
      nonceStr: nonceStr,
      package: 'prepay_id=' + prepayId,
      signType: 'MD5'
    }
    data.paySign = this.sign(merchant, data)
    return data
  }
}

export default WechatPay
