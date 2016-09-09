# 一个node微信库

慢慢扩充状态

2016-9-9微信授权：

**简单用法：**

```js
var express = require('express')
var wechat = require('weixinjs')('12345')//'12345'为微信公众号token
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
}));

app.get('/wechat', wechat.auth())

app.post('/wechat', function (req, res) {
	console.log(req.body)
	res.json({name: 1})
})

app.listen(3000, function (err) {
	if(!err) {
		console.log('server is running on port 3000')
	}
})
```
