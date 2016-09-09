'use strict'
const crypto = require('crypto');

function calcSignature (token, timestamp, nonce) {
  let s = [token, timestamp, nonce].sort().join('')
  return crypto.createHash('sha1').update(s).digest('hex')
}

function checkSignature (token, query) {
  if(!query) return false

  let signature = query.signature

  return signature === calcSignature(token, query.timestamp, query.nonce)
}

function Wechat (options) {
  if (!(this instanceof Wechat)) return new Wechat(options)
  if ('string' === typeof options) {
    options = {token: options}
  }
  this.options = options || {}
}

Wechat.prototype.auth = function () {
  let token = this.options.token
  return function (req, res, next) {
    if(!checkSignature(token, req.query)) {
      res.statusCode = 401
      return res.end('Invalid Signature')
    }

    if(req.method === 'GET') {
      return res.end(req.query.echostr)
    }
  }
}


module.exports = Wechat
