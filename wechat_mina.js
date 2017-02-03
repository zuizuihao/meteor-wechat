import wechatAuth from './wechat_auth.js'

WechatMina = {}

WechatMina.createwxaqrcode = function (app, path, width, cb) {
  wechatAuth.getToken(app, (error, access_token) => {
    HTTP.post('https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode', {
      params: {
        access_token: access_token
      },
      data: {
        path: path,
        width: width
      },
      npmRequestOptions: {
        encoding: null
      }
    }, cb)
  })
}