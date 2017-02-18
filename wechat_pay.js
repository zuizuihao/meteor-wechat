// https://github.com/node-weixin/node-weixin-pay
import wechatAuth from './wechat_auth.js'
import utils from './wechat_util.js'
import wechatRequest from './wechat_request.js'

var xml = require('xml')

const config = Meteor.settings.private.wechat
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
  data.appid = config.app.id
  /* eslint camelcase: [2, {properties: "never"}] */
  data.mch_id = config.merchant.id

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

WechatPay.transfer = function (data, callback) {
  //企业付款
  data.mch_appid = config.app.id
  data.mchid = config.merchant.id

  pay.request('https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers', data, (error, result) => {
    if (error) {
      if (callback)
        callback(error, result)
      return
    }
    console.log(error);
    console.log(result);
    if (callback)
      callback(null, result)
  })
}

WechatPay.sendredpack = function (data, callback) {
  //发送普通红包
  data.wxappid = config.app.id
  data.mch_id = config.merchant.id

  pay.request('https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack', data, (error, result) => {
    if (error) {
      if (callback)
        callback(error, result)
      return
    }
    console.log(error);
    console.log(result);
    if (callback)
      callback(null, result)
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
    params.nonce_str = utils.getNonce()
    var sign = pay.sign(config.merchant, params)
    params.sign = sign
    console.log(params);
    var xml = utils.toXml(params)
    wechatRequest.xmlssl(url, xml, config.certificate, cb)
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
