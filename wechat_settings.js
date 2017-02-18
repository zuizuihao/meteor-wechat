// https://github.com/node-weixin/node-weixin-settings

const {setting_url} = Meteor.settings.private.wechat

export default {
  get: function (id, key, cb) {
    HTTP.get(setting_url + 'get', {
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
    HTTP.post(setting_url + 'set', {
      data: {
        id: id,
        key: key,
        value: value
      }
    }, cb)
  }
}
