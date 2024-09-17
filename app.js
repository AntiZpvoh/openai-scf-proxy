const express = require('express')
const {
  createProxyMiddleware
} = require('http-proxy-middleware');
const app = express()
const port = 9000

function convertTime(timestamp){
  var newDate = new Date();
  newDate.setTime(timestamp*1000);
  return newDate.toUTCString();
}

// app.use(express.json())
// app.use(express.urlencoded({extended: true}))
app.all('/chatgpt-proxy/*', createProxyMiddleware({
  target: 'https://api.openai.com',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // 移除 'x-forwarded-for' 和 'x-real-ip' 头，以确保不传递原始客户端 IP 地址等信息
    console.log(`[${convertTime(Date.now())}] Req URL: `, req.url);
    console.log(`[${convertTime(Date.now())}] Req Headers from ${req.ip}: `, req.headers);
    proxyReq.removeHeader('x-forwarded-for');
    proxyReq.removeHeader('x-real-ip');
    // console.log(`[${convertTime(Date.now())}] Req URL: `, req.originalUrl);
    // console.log(`[${convertTime(Date.now())}] Req headers from ${req.originalUrl}: `, req.headers);
  },
  onProxyRes: function (proxyRes, req, res) {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  }
}));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
