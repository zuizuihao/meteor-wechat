/*
* source:https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141275&token=&lang=zh_CN
*/
import wechatAuth from './wechat_auth.js'
import wechatSettings from './wechat_settings.js'

var setting = Meteor.settings.private.wechat_mp.app
if (!setting) {
  console.log('error', 'Please Add wechat_mp setting.')
}

WechatUser = {}

WechatUser.getOpenIdList = function (next_openid, cb) {
  wechatAuth.getToken(setting, (error, access_token) => {
    HTTP.get('https://api.weixin.qq.com/cgi-bin/user/get', {
      headers: {
        Accept: 'application/json'
      },
      params: {
        access_token: access_token,
        next_openid: next_openid
      }
    }, cb)
  })
}

WechatUser.getUserInfo = function (openid, cb) {
  wechatAuth.getToken(setting, (error, access_token) => {
    HTTP.get('https://api.weixin.qq.com/cgi-bin/user/info', {
      headers: {
        Accept: 'application/json'
      },
      params: {
        access_token: access_token,
        openid: openid
      }
    }, cb)
  })
}

WechatUser.getUserInfoList = function (openIdList, cb) {
  var user_list = []
  openIdList.forEach(function (openid) {
    user_list.push({
      'openid': openid
    })
  }, this)

  wechatAuth.getToken(setting, (error, access_token) => {
    HTTP.post('https://api.weixin.qq.com/cgi-bin/user/info/batchget', {
      headers: {
        Accept: 'application/json'
      },
      params: {
        access_token: access_token,
      },
      data: {
        'user_list': user_list
      }
    }, cb)
  })
}
