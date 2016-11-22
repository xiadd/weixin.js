const expect = require('chai').expect
const app = require('./common')
const request = require('supertest')(app)

describe('post请求', function () {
  it('没有发送xml请求', function (done) {
    request
    .post('/wechat')
    .expect(400, {
      code: -1,
      msg: '请将xml序列化 body-parser-xml'
    }, done)
  })

  it('微信消息回复', function (done) {
    request
    .post('/wechat')
    .set('Content-type', 'text/xml')
    .send('<xml> <ToUserName> <![CDATA[gh_e06019c41597]]> </ToUserName> <FromUserName> <![CDATA[old9juDyPzWd7zsc0Y8u1LBpKwu8]]> </FromUserName> <CreateTime>1479741290</CreateTime> <MsgType> <![CDATA[text]]> </MsgType> <Content> <![CDATA[你好]]> </Content> <MsgId>6355440447502288318</MsgId> </xml>')
    .expect(200, done)
  })
})
