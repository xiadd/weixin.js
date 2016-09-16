var wechat = require('../')(12345)
var API = wechat.API
var expect = require('chai').expect
var config = require('./config')

describe('微信access_token测试', function() {
  it('access_token获取', function (done) {
    new API(config.appid, config.secret, function (token) {
      expect(token).to.have.any.keys('accessToken', 'expireTime')
      expect(token.accessToken).to.be.a('string')
      expect(token.expireTime).to.be.a('number')
      done()
    })
  })

  it('获取最新的token', function (done) {
    expect(1+1).to.equal(2)
    done()
  })
});
