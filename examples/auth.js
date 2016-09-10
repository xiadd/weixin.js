var express = require('express')
var wechat = require('weixinjs')('12345')
const bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);

var app = express()

//解析xml
app.use(bodyParser.xml({
  limit: '1MB',
  xmlParseOptions: {
    normalize: true,
    normalizeTags: true,
    explicitArray: false
  }
}))

app.use('/wechat', wechat.auth())

app.listen(3000, function (err) {
	if(!err) {
		console.log('server is running on port 3000')
	}
})
