var express = require('express')
var expect = require('chai').expect
var qs = require('querystring')
var wechat = require('../')('12345')
var bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);

var app = express()

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
var request = require('supertest')(app)

describe('微信接入', function() {
  it('接入请求401', function (done) {
    request
    .get('/wechat')
    .expect(401)
    .expect('Invalid Signature', done);
  })

  it('接入请求200', function (done) {
    var q = {
      timestamp: new Date().getTime(),
      nonce: parseInt((Math.random() * 10e10), 10)
    }
    var s = ['12345', q.timestamp, q.nonce].sort().join('')
    q.signature = require('crypto').createHash('sha1').update(s).digest('hex')
    q.echostr = 'test'
    request
    .get('/wechat?' + qs.stringify(q))
    .expect(200)
    .expect('test', done);
  })
});
