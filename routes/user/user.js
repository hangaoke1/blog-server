const multiparty = require('multiparty');
var Item = require('../../models/db.js').accounts;
exports.login = function(req, res, next) {
  const form = new multiparty.Form();
  form.parse(req, function(err, fields, files) {
    if (err) return next(err);
    var account = fields.account;
    var password = fields.password;
    Item.findOne({ 'account': account }, function(err, items) {
      if (err) return next(err);
      if (!items) {
        var data = resMsg('9994', '账号不存在')
        res.json(data);
        return false;
      }
      if (items.password == password) {
        var user = items;
        req.session.user = user;
        var data = resMsg('00', '登陆成功', user)
        res.json(data);
      } else {
        var data = resMsg('9993', '账号或者密码错误')
        res.json(data);
      }
    })
  })
}

exports.logout = function(req, res) {
  if (req.session.user) {
    console.log('准备销毁session')
    req.session.destroy(function(err) {
      var data = resMsg('00', '退出成功')
      res.json(data)
    })
  } else {
    res.json('清先登陆')
  }
}
exports.add = function(req, res ,next) {
  const form = new multiparty.Form();
  form.parse(req, function(err, fields, files) {
    if (err) return next(err);
    var account = fields.account;
    var password = fields.password;
    var name = fields.name;
    console.log(account);
    Item.find({ 'account': account }, function(err, items) {
      if (items.length >= 1) {
        var data = resMsg('9995', '账号重复')
        res.json(data);
      } else {
        Item.create({
          account: account,
          password: password,
          name: name,
          icon: 'http://hgkcdn.oss-cn-shanghai.aliyuncs.com/HGKblog/img/%E5%A4%B4%E5%83%8F.png',
          action: '0'
        }, function(err) {
          if (err) return next(err);
          var data = resMsg('00', '注册成功')
          res.json(data);
        })
      }
    })
  })
}

exports.getmsg = function(req, res) {
  if (req.session.user) {
    var user = req.session.user;
    var data = resMsg('00', '获取成功', user)
    res.json(data);
  } else {
    res.json('清先登陆')
  }
}

exports.list = function(req, res , next) {
  const form = new multiparty.Form();
  Item.find(function(err, items) {
    if (err) return next(err);
    var item = JSON.stringify(items);
    res.end(item);
  })
}


function resMsg(code, message, data) {
  return {
    code: code,
    message: message,
    data: data || {}
  }
}
