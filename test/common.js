const express = require('express')
const bodyParser = require('body-parser')
require('body-parser-xml')(bodyParser)
const wechat = require('../')('12345')

const app = express()

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

module.exports = app
