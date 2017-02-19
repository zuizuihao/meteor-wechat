// https://github.com/node-weixin/node-weixin-oauth
import utils from './wechat_util.js'

const {work} = Meteor.settings.private.wechat

WechatWork = {}

var userAgent = 'Meteor'
if (Meteor.release)
  userAgent += '/' + Meteor.release

WechatWork.createWorkURL = function (redirectUri, state, scope, type) {
  type = 0
  var oauthUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize'
  var params = {
    appid: work.id,
    redirect_uri: redirectUri,
    // Only on type currently
    response_type: ['code'][type],
    scope: ['snsapi_base', 'snsapi_userinfo'][scope],
    state: state
  }
  return oauthUrl + '?' + utils.toParam(params) + '#wechat_redirect'
}

WechatWork.getWorkToken = function () {
  return WechatWork.getWorkTokenResponse(work)
}

WechatWork.getWorkTokenResponse = function (app) {
  var response
  try {
    response = HTTP.get('https://qyapi.weixin.qq.com/cgi-bin/gettoken', {
      headers: {
        Accept: 'application/json',
        'User-Agent': userAgent
      },
      params: {
        corpid: app.id,
        corpsecret: app.secret
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

WechatWork.getUserInfo = function (access_token, code) {
  var response
  try {
    response = HTTP.get('https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo', {
      headers: {
        Accept: 'application/json',
        'User-Agent': userAgent
      },
      params: {
        access_token: access_token,
        code: code
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

WechatWork.getUser = function (access_token, userid) {
  var response
  try {
    response = HTTP.get('https://qyapi.weixin.qq.com/cgi-bin/user/get', {
      headers: {
        Accept: 'application/json',
        'User-Agent': userAgent
      },
      params: {
        access_token: access_token,
        userid: userid
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
