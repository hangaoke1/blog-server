var http = require('http');
// var sys = require('sys');
var fs = require('fs');
// 引入 events 模块
var events = require('events');
// 创建 eventEmitter 对象
var eventEmitter = new events.EventEmitter();

http.createServer(function(req, res) {
  // debugHeaders(req);

  if (req.headers.accept && req.headers.accept == 'text/event-stream') {
    if (req.url == '/events') {
      eventEmitter.on('time',function(){
        sendSSE(req, res);
      })
    } else {
      res.writeHead(404);
      res.end();
    }
  } else if(req.url == '/time'){
    eventEmitter.emit('time');
    res.end('成功发送消息');
  }else{
    res.writeHead(200, {'Content-Type': 'text/html'});
    // res.write(fs.readFileSync(__dirname + '/sse-node.html'));
    res.write(fs.readFileSync(__dirname + '/sse.html'));
    res.end();
  }
}).listen(8000);


function sendSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  var id = (new Date()).toLocaleTimeString();

  setInterval(function() {
    constructSSE(res, id, (new Date()).toLocaleTimeString());
  }, 5000);

  constructSSE(res, id, (new Date()).toLocaleTimeString());
  //res.end();
}


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
