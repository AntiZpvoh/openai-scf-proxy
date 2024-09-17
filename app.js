const express = require('express')
var fs = require('fs');
var sys = require('sys');

const {
  createProxyMiddleware
} = require('http-proxy-middleware');
const app = express()
app.set("view options", {layout: false});
app.use(express.static('/var/www/html'));
const port = 9000

function convertTime(timestamp){
  var newDate = new Date();
  newDate.setTime(timestamp);
  return newDate.toUTCString();
}

app.get('/', function(req, res){
  res.render('index.nginx-debian.html');
});

app.use('/chatgpt-proxy', createProxyMiddleware({
  target: 'https://api.openai.com',
  pathRewrite: {
    '^/chatgpt-proxy':''
  },
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // 移除 'x-forwarded-for' 和 'x-real-ip' 头，以确保不传递原始客户端 IP 地址等信息
    console.log(`[${convertTime(Date.now())}] Req URL: `, req.url);
    console.log(`[${convertTime(Date.now())}] Req Headers from ${req.ip}: `, req.headers);
    proxyReq.removeHeader('x-forwarded-for');
    proxyReq.removeHeader('x-real-ip');
  },
  onProxyRes: function (proxyRes, req, res) {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  }
}));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
