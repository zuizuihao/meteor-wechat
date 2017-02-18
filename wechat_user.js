/*
* source:https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141275&token=&lang=zh_CN
*/
import wechatAuth from './wechat_auth.js'
import wechatSettings from './wechat_settings.js'

var {mp} = Meteor.settings.private.wechat
if (!mp) {
  console.log('error', 'Please Add wechat_mp setting.')
}

WechatUser = {}

WechatUser.getOpenIdList = function (next_openid, cb) {
  wechatAuth.getToken(mp, (error, access_token) => {
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
  wechatAuth.getToken(mp, (error, access_token) => {
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

  wechatAuth.getToken(mp, (error, access_token) => {
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
