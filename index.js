const crypto = require('crypto')
const merge = require('utils-merge')
const proto = {}

let defer = typeof setImmediate === 'function'
  ? setImmediate
  : function(fn){ process.nextTick(fn.bind.apply(fn, arguments)) }

let getReplyMessage = function (data, content) {
  let message
  switch (content.msgtype) {
    case 'text':
      message = `<xml> <ToUserName><![CDATA[${data.fromusername}]]></ToUserName> <FromUserName><![CDATA[${data.tousername}]]></FromUserName> <CreateTime>${Date.now()}</CreateTime> <MsgType><![CDATA[text]]></MsgType> <Content><![CDATA[${content.content}]]></Content> </xml>`
      break
    case 'image':
      message = `<xml> <ToUserName><![CDATA[${data.fromusername}]]></ToUserName> <FromUserName><![CDATA[${data.ftousername}]]></FromUserName> <CreateTime>${Date.now()}</CreateTime> <MsgType><![CDATA[image]]></MsgType> <Image> <MediaId><![CDATA[${content.mediaid}]]></MediaId> </Image> </xml>`
      break
    case 'voice':
      message = `<xml> <ToUserName><![CDATA[${data.fromusername}]]></ToUserName> <FromUserName><![CDATA[${data.ftousername}]]></FromUserName> <CreateTime>${Date.now()}</CreateTime> <MsgType><![CDATA[voice]]></MsgType> <Voice> <MediaId><![CDATA[${content.mediaid}]]></MediaId> </Voice> </xml>`
      break
    case 'video':
      message = `<xml> <ToUserName><![CDATA[${data.fromusername}]]></ToUserName> <FromUserName><![CDATA[${data.ftousername}]]></FromUserName> <CreateTime>${Date.now()}</CreateTime> <MsgType><![CDATA[video]]></MsgType> <Video> <MediaId><![CDATA[${content.mediaid}]]></MediaId> ${content.title ? `<Title><![CDATA[${content.title}]]></Title>` : ''} ${content.description ? `<Description><![CDATA[${content.description}]]></Description>` : ''} </Video> </xml>`
      break
  }
  return message
}

let reply = function (content) {
  let res = this.res
  let req = this.req
  let data = req.messages
  return res.send(getReplyMessage(data, content))
}

let middleware = function (token) {
  function wechat(req, res, next) {
    wechat.req = req
    wechat.res = res
    wechat.next = next

    if(req.method.toLowerCase() === 'get') {
      wechat.checkSignature(token)
    } else if (req.method.toLowerCase() === 'post') {
      if (!req.body.xml) {
        return res.status(400).json({
          code: -1,
          msg: '请将xml序列化 body-parser-xml'
        })
      }
      req.messages = req.body.xml
      res.reply = reply.bind(wechat)
      if (wechat.messages.length === 0) {
        next()
      } else {
        wechat.handle(req, res, next)
      }
    }
  }
  wechat.token = token
  wechat.messages = []
  merge(wechat, proto)
  return wechat
}

proto.checkSignature = function (token) {
  let query = this.req.query,
      req = this.req,
      res = this.res
      signature = query.signature,
      timestamp = query.timestamp,
      nonce = query.nonce,
      echostr = query.echostr

  let tmpStr = crypto.createHash('sha1').update([ token, timestamp, nonce ].sort().join('')).digest('hex')
  if (tmpStr === signature) {
    return res.status(200).send(echostr)
  } else {
    return res.json({
      code: -1,
      msg: 'invalid signatrue'
    })
  }
}

proto.watch = function (type, handle) {
  let msgType = type
  let msgHandle = handle
  if (typeof msgType !== 'string') {
    msgHandle = msgType
    msgType = 'all'
  }
  if (this.messages.length !== 0) {
    for (let i = 0; i < this.messages.length; i++) {
      if (this.messages[i].type === msgType) {
        this.messages[i] = { 'type': msgType, 'handle': msgHandle }
      } else {
        this.messages.push({ 'type': msgType, 'handle': msgHandle })
      }
    }
  } else {
    this.messages.push({ 'type': msgType, 'handle': msgHandle })
  }
  return this
}

proto.handle = function (req, res, next) {
  let index = 0
  let messages = this.messages
  let done = next
  function pass(err) {
    if(err) {
      throw err
    }
    let msg = messages[index++]
    if(!msg) {
      defer(done)
      return
    }
    let type = msg.type
    let handle = msg.handle
    if(type.toLowerCase() === 'all') {
      let msgtype = req.messages.msgtype
      for (let i = 0; i < messages.length; i++) {
        if (messages[i].msgtype === msgtype) {
          return
        }
      }
      return handle(req, res, next)
    }

    if(type.toLowerCase() !== req.messages.msgtype.toLowerCase()) {
      return pass()
    }
    handle(req, res, next)
  }
  pass()
}
module.exports = middleware
