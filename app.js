const index = require('./routes/index.js');
const express = require('express');
const app = express();
const fs = require('fs')
const path = require('path')
const favicon = require('serve-favicon');
const bodyParser = require('body-parser')
const multiparty = require('multiparty');
const cookieParser = require('cookie-parser')
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const morgan = require('morgan');

const http = require('http');
const https = require('https');
var certificate = fs.readFileSync('file.crt', 'utf8');
var privateKey = fs.readFileSync('private.pem', 'utf8'),
credentials = { key: privateKey, cert: certificate };
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);
var options = {
  "host": "127.0.0.1",
  "port": "6379",
  "ttl": 60 * 60 * 24 * 30, //Session的有效期为30天
};
// 设置跨域访问
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Credentials", true); //带cookies
  res.header("X-Powered-By", ' 3.2.1')
    // res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

app.use(morgan('short'));
app.use(cookieParser('sessiontest'));
app.use(session({
  store: new RedisStore(options),
  secret: 'sessiontest', //与cookieParser中的一致
  resave: true,
  saveUninitialized: true
}));
//模板引擎
app.set('views', path.join(__dirname + '/views'));
app.engine('.html', require('ejs').__express)
app.set('view engine', 'ejs')
app.use(favicon('./favicon.ico'))
  // body 解析中间件
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
  // cookie 解析中间件
app.use(cookieParser())
  // 设置 express 根目录
app.use(express.static(path.join(__dirname, 'public')))

app.use('/',index)

  //全局error中间件
app.use(function(err, req, res, next) {
  console.log("Error happens", err.stack);
});
// app.listen(3000)
httpServer.listen(3000, function() {
  console.log('HTTP Server is running on: http://localhost:%s', 3000);
});
httpsServer.listen(3001, function() {
  console.log('HTTPS Server is running on: http://localhost:%s', 3001);
});
