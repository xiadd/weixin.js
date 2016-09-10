'use strict'
const crypto = require('crypto')
const xml2js = require('xml2js')
const events = require('events')
const emitter = new events.EventEmitter()

function calcSignature (token, timestamp, nonce) {
  let s = [token, timestamp, nonce].sort().join('')
  return crypto.createHash('sha1').update(s).digest('hex')
}

function checkSignature (token, query) {
  if(!query) return false

  let signature = query.signature
  return signature === calcSignature(token, query.timestamp, query.nonce)
}

//服务器可以回复的消息
//types: ['text', 'image', 'video', 'voice', 'music', 'news']
//分别代表文字，图像，视频，语音，音乐和图文消息
function toXML (data, content) {
  let msgtype = ''
  if(typeof content !== 'object') return '必须传入固定格式的对象'
  if(!content.msgtype) {
    if (content.hasOwnProperty("content")) msgtype = "text"
    if (content.hasOwnProperty("musicurl")) msgtype = "music"
    if (content.hasOwnProperty('Articles')) msgtype = "news"
  } else {
    msgtype = data.msgtype
  }
  let types = ['text', 'image', 'video', 'voice', 'music', 'news']
  let msg = '<xml>' +
            `<ToUserName><![CDATA[${data.fromusername}]]></ToUserName>` +
            `<FromUserName><![CDATA[${data.tousername}]]></FromUserName>` +
            `<CreateTime>${Date.now()/1000}</CreateTime>` +
            `<MsgType><![CDATA[${msgtype}]]></MsgType>`
  switch (msgtype) {
    case 'text':
      msg +=
        `<Content><![CDATA[${content.content}]]></Content>` +
        '</xml>'
    case 'image':
      msg +=
        '<Image>' +
        `<MediaId><![CDATA[${content.mediaid}]]></MediaId>` +
        '</Image>'
        '</xml>'
    case 'video':
      msg +=
        '<Video>' +
        `<MediaId><![CDATA[${content.mediaid}]]></MediaId>` +
        `<Title><![CDATA[${content.title}]]></Title>` +
        `<Description><![CDATA[${content.description}]]></Description>` +
        '</Video>' +
        '</xml>'
    case 'voice':
      msg +=
      '<Voice>' +
      `<MediaId><![CDATA[${content.mediaid}]]></MediaId>` +
      '</Voice>'
      '</xml>'
    case 'music':
      msg +=
        '<Music>' +
        `<Title><![CDATA[${content.title}]]></Title>` +
        `<Description><![CDATA[${content.description}]]></Description>` +
        `<MusicUrl><![CDATA[${content.musicurl}]]></MusicUrl>` +
        `<HQMusicUrl><![CDATA[${content.hqmusicurl}]]></HQMusicUrl>` +
        `<ThumbMediaId><![CDATA[${content.mediaid}]]></ThumbMediaId>` +
        '</Music>' +
        '</xml>'
  }

  return msg
}

function Wechat (options) {
  if (!(this instanceof Wechat)) return new Wechat(options)
  if ('string' === typeof options) {
    options = {token: options}
  }
  this.options = options || {}
  this.req = null
  this.res = null
}

function reply (content) {
  if(this.res === null || this.req === null) {
    return '请在微信环境内使用'
  }
  if(typeof content !== 'object') {
    return '请参看文档，传入正确的✔️参数格式'
  }
  console.log(toXML(this.req.weixin, content));
  console.log(this);
  this.res.send(toXML(this.req.weixin, content))
}

Wechat.prototype.auth = function () {
  var _this = this
  let token = this.options.token
  return function (req, res, next) {
    _this.req = req
    _this.res = res
    if(!checkSignature(token, req.query)) {
      res.statusCode = 401
      return res.end('Invalid Signature')
    }

    if(req.method === 'GET') {
      return res.end(req.query.echostr)
    } else {
      req.weixin = req.body.xml //将消息内容挂到req上
      res.reply = reply.bind(_this)
      next()
    }
  }
}

Wechat.prototype.handler = function (data) {
  emitter.emit(data.msgtype, data)
}

//用户可以触发的事件
//type: ['text', 'image', 'voice', 'video', 'shortvideo', 'location', 'link', 'event'] 共八种
//分别代表文字，图像，语音，视频，小视频，地理位置，链接，事件（取消关注点击事件等）
Wechat.prototype.watch = function (type, callback) {
  if(!callback || typeof callback !== 'function') return 'callback is required and must be function'
  let msgTypes = ['text', 'image', 'voice', 'video', 'shortvideo', 'location', 'link', 'event']

  msgTypes.forEach(function (v) {
    emitter.on(v, callback)
  })

  emitter.on('all', callback)
}


module.exports = Wechat
