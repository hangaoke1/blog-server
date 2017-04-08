const multiparty = require('multiparty');
const db = require('../../models/db.js');
const Hutils = require('../../utils/utils.js');
const resMsg = Hutils.resMsg;

/**
 * 登陆
 * /api/user/login
 * @param  {[type]}   req  
 * {
 *   account:"",
 *   password:""
 * }
 * @param  {[type]}   res  
 * {
 *   code:"",    状态码
 *   message:"", 状态信息  
 *   data:[]     数据
 * }
 */
exports.login = function(req, res, next) {
  const form = new multiparty.Form();
  form.parse(req, function(err, fields, files) {
    if (err) return next(err);
    var account = fields.account;
    var password = fields.password;
    db.findOne('schemaAccount', { 'account': account }, function(err, items) {
      if (err) return next(err);
      if (!items) {
        var data = resMsg('9994', '账号不存在')
        res.json(data);
        return false;
      }
      if (items.password == password) {
        var user = items;
        if (!req.session) {
          return next(new Error('redis disconnect'));
        } else {
          req.session.user = user;
          var data = resMsg('00', '登陆成功', user)
          res.json(data);
        }
      } else {
        var data = resMsg('9993', '账号或者密码错误')
        res.json(data);
      }
    })
  })
}


/**
 * 登出
 * /api/user/logout
 * @param  {[type]}   req  
 * {
 *   account:"",
 *   password:""
 * }
 * @param  {[type]}   res  
 * {
 *   code:"",    状态码
 *   message:""  状态信息
 * }
 */
exports.logout = function(req, res, next) {
  if (!req.session) {
    return next(new Error('redis disconnect'));
  }
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

/**
 * 注册
 * /api/user/add
 * @param  {[type]}   req  
 * {
 *   account:"",
 *   password:"",
 *   name:""
 * }
 * @param  {[type]}   res  
 * {
 *   code:"",    状态码
 *   message:""  状态信息 
 * }
 */
exports.add = function(req, res, next) {
  const form = new multiparty.Form();
  form.parse(req, function(err, fields, files) {
    if (err) return next(err);
    var account = fields.account;
    var password = fields.password;
    var name = fields.name;
    db.find('schemaAccount', { 'account': account }, {}, function(err, items) {
      if (items.length >= 1) {
        var data = resMsg('9995', '账号重复')
        res.json(data);
      } else {
        db.save('schemaAccount', {
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


/**
 * 获取当前用户信息
 * /api/user/getmsg
 * @param  {[type]}   req  
 * {}
 * @param  {[type]}   res  
 * {
 *   code:"",    状态码
 *   message:"", 状态信息 
 *   data:""
 * }
 */
exports.getmsg = function(req, res, next) {
  if (!req.session) {
    return next(new Error('redis disconnect'));
  }
  if (req.session.user) {
    var user = req.session.user;
    var data = resMsg('00', '获取成功', user)
    res.json(data);
  } else {
    res.json('清先登陆')
  }
}

/**
 * 获取用户列表
 * /api/user/list
 * @param  {[type]}   req  
 * {}
 * @param  {[type]}   res  
 * {
 *   code:"",    状态码
 *   message:"", 状态信息 
 *   data:""
 * }
 */
exports.list = function(req, res, next) {
  db.find('schemaAccount', {}, {_id:0,__v:0}, function(err, items) {
    if (err) return next(err);
    var data = resMsg('00', '查询所有用户成功', items)
    res.json(data);
  })
}
/**
 * 获取注册用户数量
 * /api/user/count
 * @param  {[type]}   req  
 * {}
 * @param  {[type]}   res  
 * {
 *   code:"",    状态码
 *   message:"", 状态信息 
 *   data:""
 * }
 */
exports.list = function(req, res, next) {
  db.count('schemaAccount', {}, function(err, count) {
    if (err) return next(err);
    var data = resMsg('00', '查询所有用户成功', count)
    res.json(data);
  })
}