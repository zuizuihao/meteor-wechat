// https://github.com/node-weixin/node-weixin-settings

const app = Meteor.settings.private.wechat_mp
if (!app) {
  console.log('error', 'Please Add wechat setting.')
}

export default {
  get: function (id, key, cb) {
    HTTP.get(app.setting_url + 'get', {
      params: {
        id: id,
        key: key
      }
    }, (error, result) => {
      if (result.content) {
        cb(JSON.parse(result.content))
      } else {
        cb(null)
      }
    })
  },
  set: function (id, key, value, cb) {
    HTTP.post(app.setting_url + 'set', {
      data: {
        id: id,
        key: key,
        value: value
      }
    }, cb)
  }
}
