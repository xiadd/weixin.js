var express = require('express')
var expect = require('chai').expect
var qs = require('querystring')
var wechat = require('../')('12345')
var bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);


var tail = require('./support')

var app = express()

var textMsg =  '<xml>' +
               '<ToUserName><![CDATA[toUser]]></ToUserName>' +
               '<FromUserName><![CDATA[fromUser]]></FromUserName>' +
               '<CreateTime>1348831860</CreateTime>' +
               '<MsgType><![CDATA[text]]></MsgType>' +
               '<Content><![CDATA[this is a test]]></Content>' +
               '<MsgId>1234567890123456</MsgId>' +
               '</xml>'

//解析xml
app.use(bodyParser.xml({
  limit: '1MB',
  xmlParseOptions: {
    normalize: true,
    normalizeTags: true,
    explicitArray: false
  }
}))

app.use('/wechat', wechat.auth())

app.post('/wechat', function (req, res) {

	wechat.watch('text', function (data) {
		res.reply({content: 'text send'})
	})

  wechat.watch('image', function (data) {
    res.reply({content: 'image send'})
  })

	wechat.handler(req.weixin)
})

var request = require('supertest')(app)

describe('自动回复', function() {
  it('文字消息', function (done) {
    request
    .post('/wechat' + tail())
    .set('Content-Type', 'text/xml')
    .send(textMsg)
    .expect(200)
    .end(function (err, res) {
      if(err) return done(err)
      expect(res.text).to.contain('<Content><![CDATA[text send]]></Content>')
      done()
    })
  })
});
