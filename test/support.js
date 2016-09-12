var qs = require('querystring')

function tail () {
  var q = {
    timestamp: new Date().getTime(),
    nonce: parseInt((Math.random() * 10e10), 10)
  }
  var s = ['12345', q.timestamp, q.nonce].sort().join('')
  q.signature = require('crypto').createHash('sha1').update(s).digest('hex')
  q.echostr = 'test'
  return '?' + qs.stringify(q)
}

module.exports = tail
