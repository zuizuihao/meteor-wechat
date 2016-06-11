/*
* source:https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141275&token=&lang=zh_CN
*/
import wechatAuth from './wechat_auth.js'
import wechatSettings from './wechat_settings.js'

var setting = Meteor.settings.private.wechat_mp
if (!setting) {
  console.log('error', 'Please Add amap setting.')
}

WechatCS = {}

WechatCS.getkflist = function (cb) {
  wechatAuth.getToken(setting, (error, access_token) => {
    HTTP.get('https://api.weixin.qq.com/cgi-bin/customservice/getkflist', {
      headers: {
        Accept: 'application/json'
      },
      params: {
        access_token: access_token
      }
    }, cb)
  })
}

WechatCS.getonlinekflist = function (cb) {
  wechatAuth.getToken(setting, (error, access_token) => {
    HTTP.get('https://api.weixin.qq.com/cgi-bin/customservice/getonlinekflist', {
      headers: {
        Accept: 'application/json'
      },
      params: {
        access_token: access_token
      }
    }, cb)
  })
}

WechatCS.add = function (accountName, nickname, password, cb) {
  wechatAuth.getToken(setting, (error, access_token) => {
    HTTP.post('https://api.weixin.qq.com/customservice/kfaccount/add', {
      headers: {
        Accept: 'application/json'
      },
      params: {
        access_token: access_token,
      },
      data: {
        'kf_account': accountName,
        'nickname': nickname,
        'password': password
      }
    }, cb)
  })
}

WechatCS.update = function (accountName, nickname, password, cb) {
  wechatAuth.getToken(setting, (error, access_token) => {
    HTTP.post('https://api.weixin.qq.com/customservice/kfaccount/update', {
      headers: {
        Accept: 'application/json'
      },
      params: {
        access_token: access_token,
      },
      data: {
        'kf_account': accountName,
        'nickname': nickname,
        'password': password
      }
    }, cb)
  })
}

WechatCS.del = function (kf_account, cb) {
  wechatAuth.getToken(setting, (error, access_token) => {
    HTTP.post('https://api.weixin.qq.com/customservice/kfaccount/del', {
      headers: {
        Accept: 'application/json'
      },
      params: {
        access_token: access_token,
        kf_account: kf_account
      }
    }, cb)
  })
}