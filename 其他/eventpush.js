var http = require('http');
var events = require('events')
var proxy = new events.EventEmitter();
const express = require('express');
const app = express();
const httpServer = http.createServer(app);
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ioRedis = require('ioredis');
var redis = new ioRedis();

var memwatch = require('memwatch');
//  注意是不同的redis实例
var sub = new ioRedis();
var pub = new ioRedis();
sub.subscribe('HKG');


var tipArr = {};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

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

var opid = 0;
app.use('/do',function(req,res,next){
  for(var key in tipArr) {
    tipArr[key]('hello');
}
res.end('done')
})
app.use('/add',function(req,res,next){
  tipArr[opid] = function(hello) {
    console.log(req.body.name);
    console.log(hello);
  }
  sub.on('message',function(){
    console.log(123);
  })
  // opid++;
  res.end('success');
})
app.use('/remove',function(req,res,next){
  sub.removeListener('message',asd)
})
app.use('/show',function(req,res,next){
  console.log(sub._events);
  res.end('success')
})
app.use('/events',function(req, res, next) {
    sendSSE(req, res);
  })
  // http.createServer(function(req, res) {
  //   // debugHeaders(req);

//   if (req.headers.accept && req.headers.accept == 'text/event-stream') {
//     if (req.url == '/events') {
//       sendSSE(req, res);
//     } else {
//       res.writeHead(404);
//       res.end();
//     }
//   } else {
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     res.end();
//   }
// }).listen(8000);

httpServer.listen(8000, function() {
  console.log('HTTP Server is running on: http://localhost:%s', 8000);
});


function sendSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  var id = (new Date()).toLocaleTimeString();

  // setInterval(function() {
  //   constructSSE(res, id, (new Date()).toLocaleTimeString());
  // }, 5000);

  constructSSE(res, id, (new Date()).toLocaleTimeString());
  //res.end();
}

//只有包含data:的数据行后面有空行时才触发message事件
//data:foo
//data:bar
//的event.data值为 "for/nbar" 注意换行符
function constructSSE(res, id, data) {
  res.write('id: ' + id + '\n');
  res.write("data: " + data + '\n\n');
}

// function debugHeaders(req) {
//   sys.puts('URL: ' + req.url);
//   for (var key in req.headers) {
//     sys.puts(key + ': ' + req.headers[key]);
//   }
//   sys.puts('\n\n');
// }
