'use strict'
//创建对象以及维护access_token
const request = require('request')

function AccessToken (accessToken, expireTime) {
  if (!(this instanceof AccessToken)) {
    return new AccessToken(accessToken, expireTime)
  }

  this.accessToken = accessToken
  this.expireTime = expireTime
}

AccessToken.prototype.isValid = function () {
  return this.accessToken && Date.now()/1000 < this.expireTime
}

/**
 * 实例化的时候先获取和保存token
 * getToken 不言而喻
 */

let API = function (appid, secret, saveToken) {
  this.appid = appid
  this.secret = secret
  //通用
  this.commonPrefix = 'https://api.weixin.qq.com/cgi-bin/'
  //上海
  this.shPrefix = 'https://sh.weixin.qq.com/cgi-bin/'
  //深圳
  this.szPrefix = 'https://sz.weixin.qq.com/cgi-bin/'
  //香港
  this.hkPrefix = 'https://hk.weixin.qq.com/cgi-bin/'

  this.store = ''

  if(!saveToken) {
    throw new Error('请保存token')
  }
  this.getAccessToken().then(token => {
    this.store = token
    saveToken(token)
  })

}

API.prototype.getAccessToken = function () {
  let url = this.commonPrefix + `token?grant_type=client_credential&appid=${this.appid}&secret=${this.secret}`
  return new Promise((resolve, reject) => {
    request
    .get(url)
    .on('error', err => {
      reject(err.message)
    })
    .on('data', data => {
      let a_token = JSON.parse(data.toString())
      //临界点20s
      let expireTime = Date.now()/1000 + (a_token['expires_in'] - 20)
      let token = AccessToken(a_token['access_token'], expireTime)
      resolve(token)
    })
  })
}

API.prototype.getLatestToken = function () {
  if(typeof this.store === 'object' && AccessToken(this.store.accessToken, this.store.expireTime).isValid()) {
    console.log(11);
    return Promise.resolve(this.store)
  } else {
    return this.getAccessToken().then(token => {
      return token
    })
  }
}

module.exports = API;
