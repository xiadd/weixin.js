# 一个express微信消息中间件

![](https://travis-ci.org/xiadd/weixin.js.svg?branch=master)
![](https://david-dm.org/xiadd/weixin.js.svg)
[![Github All Releases](https://img.shields.io/github/downloads/xiadd/weixin.js/total.svg)]()

相当简单的中间件。暂时没添加太多异常处理，测试覆盖也不完善。后续会解决。

## 安装

`npm install weixinjs`

**简单用法：**

```js
const express = require('express')
const bodyParser = require('body-parser')
require('body-parser-xml')(bodyParser)
const morgan = require('morgan')
const wechat = require('./wechat')('12345')

const app = express()
app.use(morgan('dev'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.xml({
  limit: '1MB',
  xmlParseOptions: {
    normalize: true,
    normalizeTags: true,
    explicitArray: false
  }
}))

app.use('/wechat', wechat)
app.post('/wechat', function (req, res) {
  wechat
    .watch('text', function (req, res) {
      res.reply({content: '文字', msgtype: 'text'})
    })
    .watch('image', function (req, res) {
      res.reply({content: '图片', msgtype: 'text'})
    })
    .watch('shortvideo', function (req, res) {
      res.reply({content: '小视频', msgtype: 'text'})
    })
    .watch('location', function (req, res) {
      res.reply({content: '地理位置', msgtype: 'text'})
    })
    .watch('link', function (req, res) {
      res.reply({content: '链接', msgtype: 'text'})
    })
  //或者监视全部消息
  // wechat
  //   .watch(function (req, res) {
  //     res.reply({content: '文字', msgtype: 'text'})
  //   })
})
app.listen(8080, () => console.log('server is running'))
```

## todo

事件消息的回复

关注取消关注事件等。
