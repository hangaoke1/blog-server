var express = require('express');
var router = express.Router();

var allModules = {
  user: require('./user/user.js'),
  artical: require('./articals/articals.js')
}
// 返回主页
router.get('/', function(req, res, next) {
  res.setHeader("Content-Type", "text/html");
  res.render('index.html');
})
// 通用模块路由
router.all('/api/:module/:action', function(req,res,next){
	allModules[req.params.module][req.params.action](req,res,next);
})

module.exports = router;
