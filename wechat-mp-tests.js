import { Tinytest } from "meteor/tinytest";
import WechatMessage from "./wechat_message.js";

var wechatMessage = new WechatMessage('', '');

Tinytest.add('wechat-message-sendTplMsg', function (test) {
  wechatMessage.send('', '', 'https://www.roadshr.com', {
    first: {
      value: '来订单了',
      color: '#173177'
    },
    keyword1: {
      value: '路擎科技有限公司',
      color: '#173177'
    },
    keyword2: {
      value: '河南',
      color: '# 173177'
    },
    keyword3: {
      value: '北京',
      color: '# 173177'
    },
    keyword4: {
      value: '宝马，奔驰',
      color: '# 173177'
    },
    keyword5: {
      value: '2016年5月1日',
      color: '# 173177'
    },
    remark: {
      value: '评论',
      color: '#173177'
    }
  }, function (error, data) {
    if (callback)
      callback(error, data);
  });
});
