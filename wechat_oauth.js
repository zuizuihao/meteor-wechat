// https://github.com/node-weixin/node-weixin-oauth
import utils from './wechat_util.js'

const app = Meteor.settings.private.wechat_mp.app
if (!app) {
  console.log('error', 'Please Add wechat_open setting.')
}

const web = Meteor.settings.private.wechat_open
if (!web) {
  console.log('error', 'Please Add wechat_open setting.')
}

WechatOAuth = {}

var userAgent = 'Meteor'
if (Meteor.release)
  userAgent += '/' + Meteor.release

WechatOAuth.createMobileURL = function (redirectUri, state, scope, type) {
  type = 0
  var oauthUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize'
  var params = {
    appid: app.id,
    redirect_uri: redirectUri,
    // Only on type currently
    response_type: ['code'][type],
    scope: ['snsapi_base', 'snsapi_userinfo'][scope],
    state: state
  }
  return oauthUrl + '?' + utils.toParam(params) + '#wechat_redirect'
}

WechatOAuth.createWebURL = function (redirectUri, state) {
  type = 0
  var oauthUrl = 'https://open.weixin.qq.com/connect/qrconnect'
  var params = {
    appid: web.id,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'snsapi_login',
    state: state
  }
  return oauthUrl + '?' + utils.toParam(params) + '#wechat_redirect'
}

WechatOAuth.getMobileToken = function (query) {
  return WechatOAuth.getTokenResponse(app, query)
}

WechatOAuth.getWebToken = function (query) {
  return WechatOAuth.getTokenResponse(web, query)
}

WechatOAuth.getTokenResponse = function (app, query) {
  var response
  try {
    response = HTTP.post('https://api.weixin.qq.com/sns/oauth2/access_token', {
      headers: {
        Accept: 'application/json',
        'User-Agent': userAgent
      },
      params: {
        code: query.code,
        appid: app.id,
        secret: app.secret,
        grant_type: 'authorization_code'
      }
    })
  } catch (err) {
    throw _.extend(new Error('Failed to complete OAuth handshake with Wechat. ' + err.message), {
      response: err.response
    })
  }

  response = JSON.parse(response.content)
  if (response.errcode) {
    throw new Error('Failed to complete OAuth handshake with Wechat. ' + response.errmsg)
  } else {
    return response
  }
}

WechatOAuth.getUserInfo = function (access_token, openid) {
  var response
  try {
    response = HTTP.get('https://api.weixin.qq.com/sns/userinfo', {
      headers: {
        Accept: 'application/json',
        'User-Agent': userAgent
      },
      params: {
        access_token: access_token,
        openid: openid
      }
    })
  } catch (err) {
    throw _.extend(new Error('Failed to complete OAuth handshake with Wechat. ' + err.message), {
      response: err.response
    })
  }

  response = JSON.parse(response.content)
  if (response.errcode) {
    throw new Error('Failed to complete OAuth handshake with Wechat. ' + response.errmsg)
  } else {
    return response
  }
}
