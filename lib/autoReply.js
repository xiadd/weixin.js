'use strict'
const xml2js = require('xml2js')
const events = require('events')
const emitter = new events.EventEmitter()

function handler(req, res, next) {
  let msg = req.body
  res.on('end', function () {
    parseMsg(msg)
  })
  next()
}

function parseMsg (data) {

  let msg = data.xml

  switch(msg.msgtype) {
    case 'text':
      emitter.emit('text', msg)
      break
    case 'image':
      emitter.emit('image', msg)
      break
    case 'link':
      emitter.emit('link', msg)
      break
    case 'location':
      emitter.emit('location', msg)
      break
    case 'event':
      emitter.emit('event', msg)
      break
    case 'voice':
      emitter.emit('voice', msg)
      break
    case 'video':
      emitter.emit('video', msg)
      break
    case 'shortvideo':
      emitter.emit('shortvideo', msg)
      break
  }

  return msg
}

function watch(type, callback) {
  switch (type) {
    case 'text':
      emitter.once('text', callback)
      break;
    case 'image':
      emitter.once('image', callback)
      break
    case 'link':
      emitter.once('link', callback)
      break
    case 'location':
      emitter.once('location', callback)
      break
    case 'event':
      emitter.once('event', callback)
      break
    case 'voice':
      emitter.once('voice', callback)
      break
    case 'video':
      emitter.once('video', callback)
      break
    case 'shortvideo':
      emitter.once('shortvideo', callback)
      break
    case 'all':
      emitter.once('text', callback)
      emitter.once('image', callback)
      emitter.once('location', callback)
      emitter.once('event', callback)
      emitter.once('voice', callback)
      emitter.once('video', callback)
      emitter.once('shortvideo', callback)
  }
}

function toXMLMsg (data) {
  let MsgType = "";
  if (!data.MsgType) {
    if (data.hasOwnProperty("Content")) MsgType = "text"
    if (data.hasOwnProperty("MusicUrl")) MsgType = "music"
    if (data.hasOwnProperty("Articles")) MsgType = "news"
  } else {
    MsgType = data.MsgType
  }

  let msg = "" +
      "<xml>" +
      "<ToUserName><![CDATA[" + data.ToUserName + "]]></ToUserName>" +
      "<FromUserName><![CDATA[" + data.FromUserName + "]]></FromUserName>" +
      "<CreateTime>" + Date.now()/1000 + "</CreateTime>" +
      "<MsgType><![CDATA[" + MsgType + "]]></MsgType>"

  switch(MsgType) {
    case 'text' :
      msg += "" +
        "<Content><![CDATA[" + (data.Content || '') + "]]></Content>" +
        "</xml>";
      return msg;

    case 'image' :
      msg += "" +
        "<Image>" +
        "<MediaId><![CDATA[" + data.MediaId +"]]></MediaId>" +
        "</Image>" +
        "</xml>";

    case 'voice' :
      msg += "" +
        "<Voice>" +
        "<MediaId><![CDATA[" + data.MediaId +"]]></MediaId>" +
        "<Title><![CDATA[" + data.Title +"]]></Title>" +
        "<Description><![CDATA[" + data.Description +"]]></Description>" +
        "</Voice>" +
        "</xml>";

    case 'video' :
      msg += "" +
        "<Video>" +
        "<MediaId><![CDATA[" + data.MediaId +"]]></MediaId>" +
        "</Video>" +
        "</xml>";

    case 'music' :
      msg += "" +
        "<Music>" +
        "<Title><![CDATA[" + (data.Title || '') + "]]></Title>" +
        "<Description><![CDATA[" + (data.Description || '') + "]]></Description>" +
        "<MusicUrl><![CDATA[" + (data.MusicUrl || '') + "]]></MusicUrl>" +
        "<HQMusicUrl><![CDATA[" + (data.HQMusicUrl || data.MusicUrl || '') + "]]></HQMusicUrl>" +
        "<ThumbMediaId><![CDATA[" + (data.ThumbMediaId || '') + "]]></ThumbMediaId>" +
        "</Music>" +
        "</xml>"
      return msg
  }
}

function reply(data) {
  return function (req, res, next) {
    let msg = parseMsg(req.body)
    if(req.method !== 'POST') {
      return res.end('微信消息请求方式必须为post')
    }
    res.writeHead(200, {'Content-Type': 'text/plain'})
    console.log(toXMLMsg(data));
    return res.end(toXMLMsg(data))
  }
}

exports.watch = watch
exports.reply = reply
exports.handler = handler
