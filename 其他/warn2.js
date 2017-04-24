const path = require('path')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
var config = require('./config');
var constant = require('./routes/common/constant');
//  server链接
const express = require('express');
const app = express();
const http = require('http');
const httpServer = http.createServer(app);
var io = require('socket.io')(httpServer);


// 跨域设置
app.all('*', function(req, res, next) {

  if (app.get('env') == 'development') {
    if (req.headers.origin) {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
    }
  } else if (req.headers.origin) {


    // 跨域访问域设置
    for (var i = 0; i < config.allowOrigins.length; i++) {
      var allowOrigin = config.allowOrigins[i];

      if (req.headers.origin === allowOrigin) {
        res.header('Access-Control-Allow-Origin', allowOrigin);
        break;
      }
    }
  } else {
    res.header('Access-Control-Allow-Origin', config.allowOrigins[0]);
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  // OPTIONS 快速通过
  if (req.method == 'OPTIONS') {
    res.send(200);
  } else if (req.method == 'GET') { // 支持get请求 业务逻辑中参数全部从req.body中获取
    req.body = req.query;
    next();
  } else {
    next();
  }
});
// body 解析中间件
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: false,
  secret: 'eboss_node@2017',
  name: 'inode',
  cookie: { maxAge: 4 * 60 * 60 * 1000 }, //默认4小时
  store: new RedisStore({
    client: require('./routes/common/redisClient'),
    prefix: constant.redisPrefix.SESSION_PREFIX
  }),
}));


//  警告webSocket
var warn = io.of('/warnTips');
warn.on('connection', function(socket) {
  socket.on('hgk', function(data) {
    socket.broadcast.emit('warn', data);
  })
  socket.on('warn', function(data) {
    console.log('接受到消息了')
  })
});


app.use('/warn', function(req, res, next) {
  var message = req.body.message;
  warn.emit('warn', message);
  var count = Object.keys(warn.adapter.rooms).length;
  console.log(warn);
  res.end('success  count:' + count);
})
app.use('/', function(req, res, next) {
  res.end('welcome to Monitor page!');
})

//全局error中间件
app.use(function(err, req, res, next) {
  console.log("Error happens", err.stack);
});
// app.listen(6666)
httpServer.listen(6666, function() {
  console.log('HTTP Server is running on: http://localhost:%s', 6666);
});
