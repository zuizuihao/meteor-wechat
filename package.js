Package.describe({
  name: 'roadshr:wechat',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
})

Npm.depends({
  'xml2js': '0.4.16',
  'request': '2.72.0',
  'xml': '1.0.1'
})

Package.onUse(function (api) {
  api.versionsFrom('1.3.2.4')
  api.use('ecmascript')
  api.use('http')
  api.use('check')
  api.export('WechatMessage', 'server')
  api.export('WechatJSSDK', 'server')
  api.export('WechatOAuth', 'server')
  api.export('WechatAuth', 'server')
  api.export('WechatCS', 'server')
  api.export('WechatUser', 'server')
  api.export('WechatPay', 'server')
  api.addFiles('wechat_message.js', 'server')
  api.addFiles('wechat_jssdk.js', 'server')
  api.addFiles('wechat_oauth.js', 'server')
  api.addFiles('wechat_auth.js', 'server')
  api.addFiles('wechat_cs.js', 'server')
  api.addFiles('wechat_user.js', 'server')
  api.addFiles('wechat_pay.js', 'server')
})

Package.onTest(function (api) {
  api.use('ecmascript')
  api.use('tinytest')
  api.use('http')
  api.use('check')
  api.use('roadshr:wechat-mp', 'server')
  api.mainModule('wechat-mp-tests.js', 'server')
})
