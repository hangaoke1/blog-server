var express = require('express');
var app = express();
var http = require('http');
var httpServer = http.createServer(app);
var path = require('path')
var multer = require('multer')
var upload = multer({ dest: 'tmp/' })
var fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
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

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
  // cookie 解析中间件
app.use(cookieParser())
app.use('/up', function(req, res) {
  res.setHeader('Content-Type', 'text/html;charset=utf-8');
  res.sendFile(path.join(__dirname + '/up.html'));
})
app.use('/upload', upload.single('file'), function(req, res) {
  var tmp_path = req.file.path;
  var target_path = './public/' + req.file.originalname;
  fs.rename(tmp_path, target_path, function(err) {
    if (err) throw err;
    // 删除临时文件夹文件, 
    fs.unlink(tmp_path, function() {
      if (err) throw err;
      res.send('File uploaded to: ' + target_path + ' - ' + req.file.size + ' bytes');
    });
  });
})

httpServer.listen('4000', function() {

})
