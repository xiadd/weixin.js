'use strict'
const weixinAuth = require('./auth')
const watch = require('./autoReply').watch
const reply = require('./autoReply').reply
const handler = require('./autoReply').handler

function Wechat (options) {
  if (!(this instanceof Wechat)) return new Wechat(options)
  if ('string' === typeof options) {
    options = {token: options}
  }
  this.options = options || {}
  this.reply()
}

Wechat.prototype.auth = weixinAuth

Wechat.prototype.watch = watch

Wechat.prototype.reply = reply

Wechat.prototype.handler = handler


module.exports = Wechat
