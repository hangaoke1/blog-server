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
// console.log(process.env.REMOTE_ADDR)
const http = require('http');
const https = require('https');
var certificate = fs.readFileSync('file.crt', 'utf8');
var privateKey = fs.readFileSync('private.pem', 'utf8'),
  credentials = { key: privateKey, cert: certificate };
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);
// socket
var webSocket = require('./socket/warn.js');
webSocket.listen(httpServer);
// redis
var redis = require('./redis/redis.js').reids;
var sub = require('./redis/redis.js').redis;
var pub = require('./redis/redis.js').pub;
// 设置跨域访问
app.all('*', function(req, res, next) {
  // console.log(req.headers.origin);
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Credentials", true); //带cookies
  res.header("X-Powered-By", ' 3.2.1')
    // res.header("Content-Type", "application/json;charset=utf-8");
  if (req.method == 'OPTIONS') {
    res.send(200);
  } else if (req.method == 'GET') {
    req.body = req.query;
    next();
  } else {
    next();
  }
});
app.use(morgan('short'));
app.use(cookieParser('sessiontest'));
app.use(session({
  store: new RedisStore({
    client: redis,
    prefix: 'hgk'
  }),
  cookie: { maxAge: 1 * 60 * 60 * 1000 }, //默认1小时
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
app.use('/hgk', function(req, res) {
    res.end('hello hangaoke2');
  })
  // websocket全网告示快捷入口
app.use('/warn', function(req, res, next) {
  var time = req.body.time;
  var message = req.body.message;
  var msg = {
    time,
    message
  }
  // pub.publish('hgk','aaaaaaa2');
  // res.end('hello world')
  io.of('/warnTips').adapter.customRequest(JSON.stringify(msg), function(err, replies) {
    console.log(replies); // an array ['hello john', ...] with one element per node
  });
  io.of('/warnTips').adapter.clients(function (error, clients) {
    if (error) throw error;
    console.log(clients); // => [Anw2LatarvGVVXEIAAAD]
    res.end('res by app2.js hello world! clients in room1:' + clients.length +'-------'+JSON.stringify(user));
  });
})
app.use('/', index)

//全局error中间件
app.use(function(err, req, res, next) {
  console.log("Error happens", err.stack);
});
httpServer.listen(3002, function() {
  console.log('HTTP Server is running on: http://localhost:%s', 3002);
});
// httpsServer.listen(3001, function() {
//   console.log('HTTPS Server is running on: http://localhost:%s', 3001);
// });
