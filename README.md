# 一个node微信库

![](https://travis-ci.org/xiadd/weixin.js.svg?branch=master)
![](https://david-dm.org/xiadd/weixin.js.svg)
[![Github All Releases](https://img.shields.io/github/downloads/xiadd/weixin.js/total.svg)]()

慢慢扩充状态

2016-9-9微信授权

2016-9-10自动回复

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
})
app.listen(8080, () => console.log('server is running'))
```

~~`npm install weixinjs`~~ //太多bug 暂时取消更新npm

见示例
