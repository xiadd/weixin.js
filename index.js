var crypto = require('crypto')
var merge = require('utils-merge')
var xml2js = require('xml2js')
var proto = {}

var md5 = function (text) {
  return crypto.createHash("sha1").update(text).digest("hex")
}

var defer = typeof setImmediate === 'function'
  ? setImmediate
  : function(fn){ process.nextTick(fn.bind.apply(fn, arguments)) }

//文本消息(text) 图片消息(image) 语音消息(voice) 视频消息(video) 音乐消息(music) 图文消息(news)
var getReplyMessage = function (data, content) {
  var message
  switch (content.msgtype) {
    case 'text':
      message =
            `<xml>
              <ToUserName><![CDATA[${data.fromusername}]]></ToUserName>
              <FromUserName><![CDATA[${data.tousername}]]></FromUserName>
              <CreateTime>${Date.now()}</CreateTime>
              <MsgType><![CDATA[text]]></MsgType>
              <Content><![CDATA[${content.content}]]></Content>
            </xml>`
      break
    case 'image':
      message =
            `<xml>
              <ToUserName><![CDATA[${data.fromusername}]]></ToUserName>
              <FromUserName><![CDATA[${data.ftousername}]]></FromUserName>
              <CreateTime>${Date.now()}</CreateTime>
              <MsgType><![CDATA[image]]></MsgType>
              <Image>
              <MediaId><![CDATA[${content.mediaid}]]></MediaId>
              </Image>
            </xml>`
      break
    case 'voice':
      message =
            `<xml>
              <ToUserName><![CDATA[${data.fromusername}]]></ToUserName>
              <FromUserName><![CDATA[${data.ftousername}]]></FromUserName>
              <CreateTime>${Date.now()}</CreateTime>
              <MsgType><![CDATA[voice]]></MsgType>
              <Voice>
              <MediaId><![CDATA[${content.mediaid}]]></MediaId>
              </Voice>
            </xml>`
    break
    case 'video':
      message =
            `<xml>
              <ToUserName><![CDATA[${data.fromusername}]]></ToUserName>
              <FromUserName><![CDATA[${data.ftousername}]]></FromUserName>
              <CreateTime>${Date.now()}</CreateTime>
              <MsgType><![CDATA[video]]></MsgType>
              <Video>
              <MediaId><![CDATA[${content.mediaid}]]></MediaId>
              ${content.title ? `<Title><![CDATA[${content.title}]]></Title>` : ''}
              ${content.description ? `<Description><![CDATA[${content.description}]]></Description>` : ''}
              </Video>
            </xml>`
      break;


  }

  return message
}
/**
 * 回复文本消息：
 * {
 *  ToUserName
 *  FromUserName
 *  CreateTime: Date.now()
 *  MsgType: text
 *  Content: 消息内容
 * }
 *
 * 回复图片消息：
 * {
 *  ...类似
 *  MediaId: 通过素材管理中的接口上传多媒体文件，得到的id
 * }
 *
 * 回复语音消息：
 * {
 *  ...其他类似
 *  MediaId： 通过素材管理中的接口上传多媒体文件，得到的id
 * }
 *
 * 回复视频消息：
 * {
 *  MediaId: 通过素材管理中的接口上传多媒体文件，得到的id
 *  Title: 视频消息的标题 (不是必须)
 *  Description: 视频消息的描述(不是必须)
 * }
 *
 * 回复音乐消息:
 * {
 *  Title: 音乐标题(不是必须)
 *  Description: 音乐描述(不是必须)
 *  MusicURL: 音乐链接(不是必须)
 *  HQMusicUrl: 高质量音乐链接，WIFI环境优先使用该链接播放音乐(不是必须)
 *  ThumbMediaId: 缩略图的媒体id，通过素材管理中的接口上传多媒体文件，得到的id
 * }
 * @param  {object} content [description]
 * @return {[type]}         [description]
 */
var reply = function (content) {
  var res = this.res
  var req = this.req
  var data = req.weixin
  return res.send(getReplyMessage(data, content))
}

var middleware = function (token) {
  function wechat (req, res, next) {
    wechat.req = req
    wechat.res = res
    wechat.next = next
    var token = wechat.token
    if(req.method.toLowerCase() === 'get') {
      wechat.checkSignature(token)
    } else if (req.method.toLowerCase() === 'post'){
      req.weixin = req.body.xml //将消息内容挂到req上
      res.reply = reply.bind(wechat)
      wechat.handle(req, res, next)
    }
  }
  wechat.token = token
  wechat.messages = []
  merge(wechat, proto)
  return wechat
}

//授权
proto.checkSignature = function (token) {
  var req = this.req
  var res = this.res
  var query = req.query

  var [signature, echostr, timestamp, nonce] = [query.signature, query.echostr, query.timestamp, query.nonce]
  var toSignaArr = [nonce, timestamp, token].sort().join('')
  var sha1Str = md5(toSignaArr)

  if (sha1Str === signature) {
    return res.end(echostr)
  } else {
    return res.status(400).json({
      code: -1,
      msg: '授权失败'
    })
  }
}

//自动回复
//每种回复只能有一个处理函数
proto.watch = function (type, handle) {
  var type = type
  var handle = handle
  if (typeof type !== 'string') {
    handle = type
    type = 'all'
  }
  this.messages.push({ 'type': type, 'handle': handle })
  return this//链式调用
}

proto.handle = function (req, res, next) {
  var index = 0
  var messages = this.messages
  var done = next

  function passEvent (err) {
    var ev = messages[index++]
    if (!ev) {
      defer(done)
      return
    }

    var type = ev.type
    var handle = ev.handle

    if (ev.type.toLowerCase() !== req.weixin.msgtype.toLowerCase()) {
      return passEvent()
    }
    ev.handle(req, res, next)
  }
  passEvent()
}

function call () {

}

module.exports = middleware
