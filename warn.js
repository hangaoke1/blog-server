const fs = require('fs')
const path = require('path')
const favicon = require('serve-favicon');
const bodyParser = require('body-parser')
const multiparty = require('multiparty');
const cookieParser = require('cookie-parser')
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const morgan = require('morgan');
//  server链接
const express = require('express');
const app = express();
const http = require('http');
const httpServer = http.createServer(app);
var io = require('socket.io')(httpServer);
//  ioredis
var options = {
  "host": "127.0.0.1",
  "port": "6379",
  "ttl": 60 * 60 * 1, //Session的有效期为1小时
};
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


//  警告webSocket
var warn = io.of('/warnTips');
warn.on('connection', function(socket) {
  socket.join('roomA');
  socket.on('hgk',function(data){
   socket.broadcast.emit('warn', data); 
  })
  socket.on('warn', function(data) {
    console.log('接受到消息了')
  })
});


app.use('/warn',function(req,res,next){
  var message = req.body.message;
  warn.to('roomA').emit('warn',message);
  var count = Object.keys(warn.adapter.rooms).length;
  res.end('success  count:'+count);
})


//全局error中间件
app.use(function(err, req, res, next) {
  console.log("Error happens", err.stack);
});
// app.listen(3000)
httpServer.listen(3000, function() {
  console.log('HTTP Server is running on: http://localhost:%s', 3000);
});
