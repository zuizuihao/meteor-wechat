// https://github.com/node-weixin/node-weixin-oauth
import utils from './wechat_util.js'
import wechatSettings from './wechat_settings.js'
import CONST from './const.js'

const {work} = Meteor.settings.private.wechat

var userAgent = 'Meteor'
if (Meteor.release)
  userAgent += '/' + Meteor.release

WechatWork = {
  createWorkURL(redirectUri, state, scope, type) {
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
  },
  tokenize: function (app, cb) {
    HTTP.get('https://qyapi.weixin.qq.com/cgi-bin/gettoken', {
      params: {
        corpid: app.id,
        corpsecret: app.secret
      }
    }, function (error, response) {
      if (error) {
        cb(error, response.content)
        return
      }
      var json = JSON.parse(response.content)
      wechatSettings.get(app.id, 'auth', function (auth) {
        if (!auth) {
          auth = {}
        }
        auth.accessToken = json.access_token
        cb('', auth.accessToken)
        wechatSettings.set(app.id, 'auth', auth, () => { })
      })
    })
  },
  determine: function (app, cb) {
    var self = this
    wechatSettings.get(app.id, 'auth', function (auth) {
      var now = new Date().getTime()
      if (!auth) {
        auth = {}
      }

      if (auth.lastTime && ((now - auth.lastTime) < CONST.ACCESS_TOKEN_EXP)) {
        cb(true)
        return
      }
      auth.lastTime = now
      wechatSettings.set(app.id, 'auth', auth, function () {
        WechatWork.tokenize(app, cb)
      })
    })
  },
  getToken: function (app, cb) {
    WechatWork.determine(app, function () {
      wechatSettings.get(app.id, 'auth', function (authData) {
        cb('', authData.accessToken)
      })
    })
  },
  getUserInfo(code, callback) {
    WechatWork.getToken(work, (error, access_token) => {
      HTTP.get('https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo', {
        headers: {
          Accept: 'application/json',
          'User-Agent': userAgent
        },
        params: {
          access_token: access_token,
          code: code
        }
      }, callback)
    })
  },
  getUser(userid, callback) {
    WechatWork.getToken(work, (error, access_token) => {
      HTTP.get('https://qyapi.weixin.qq.com/cgi-bin/user/get', {
        headers: {
          Accept: 'application/json',
          'User-Agent': userAgent
        },
        params: {
          access_token: access_token,
          userid: userid
        }
      }, callback)
    })
  },
  getDepartmentList(id, callback) {
    WechatWork.getToken(work, (error, access_token) => {
      HTTP.get('https://qyapi.weixin.qq.com/cgi-bin/department/list', {
        params: {
          access_token: access_token,
        }
      }, callback)
    })
  },
  getDepartmentUserList(department_id, callback) {
    WechatWork.getToken(work, (error, access_token) => {
      HTTP.get('https://qyapi.weixin.qq.com/cgi-bin/user/simplelist', {
        params: {
          access_token: access_token,
          department_id: department_id,
          fetch_child: 1
        }
      }, callback)
    })
  }
}