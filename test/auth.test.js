var express = require('express')
var qs = require('querystring')
var wechat = require('../')('12345')

var app = express()

app.use('/wechat', wechat)
var request = require('supertest')(app)

describe('微信接入', function() {
  it('接入请求失败', function (done) {
    request
    .get('/wechat')
    .expect(200, {
      code: -1,
      msg: 'invalid signatrue'
    }, done)
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
    .expect('test', done)
  })
})
