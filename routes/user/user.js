const multiparty = require('multiparty');
const db = require('../../models/db.js');
const Hutils = require('../../utils/utils.js');
const resMsg = Hutils.resMsg;
const bcrypt = require('bcrypt-nodejs')
const SALT_WORK_FACTOR = 10;
const async = require('async');
/**
 * 登陆
 * /api/user/login
 * {
 *   account:"",
 *   password:""
 * }
 * return 
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
    db.findOne('schemaAccount', { 'account': account }, function(err, item) {
      if (err) return next(err);
      if (!item) {
        var data = resMsg('11', '账号不存在')
        res.json(data);
        return false;
      }

      bcrypt.hash(password, item.salt, null, function(err, hash) {
        if (err) return next(err)
        if (item.password === hash) {
          var user = item;
          if (!req.session) {
            return next(new Error('redis disconnect'));
          } else {
            req.session.user = user;
            var data = resMsg('00', '登陆成功', user)
            res.json(data);
          }
        } else {
          var data = resMsg('11', '账号或者密码错误')
          res.json(data);
        }
      })
    })
  })
}


/**
 * 登出
 * /api/user/logout
 * {
 *   account:"",
 *   password:""
 * }
 * return 
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
    res.json('请先登陆')
  }
}

/**
 * 注册
 * /api/user/add
 * {
 *   account:"",
 *   password:"",
 *   name:""
 * }
 * return 
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
    var safeCode = fields.safeCode;
    async.waterfall([
      //  查询账号是否重复
      function(cb) {
        db.find('schemaAccount', { 'account': account }, {}, function(err, items) {
          if (err) {
            return cb(err);
          }
          if (items.length >= 1) {
            var data = resMsg('11', '账号重复')
            res.json(data);
          } else {
            cb(null);
          }
        })
      },
      //  获得随机盐
      function(cb) {
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
          if (err) {
            return cb(err)
          }
          //  生成hash密码
          bcrypt.hash(password, salt, null, function(err, hash) {
            if (err) return cb(err)
            cb(null, salt, hash);
          })
        })
      },
      //  将新生成的账号存储
      function(salt, hash, cb) {
        db.save('schemaAccount', {
          account: account,
          password: hash,
          name: name,
          icon: 'http://hgkcdn.oss-cn-shanghai.aliyuncs.com/HGKblog/img/%E5%A4%B4%E5%83%8F.png',
          action: '0',
          safeCode: safeCode,
          salt: salt
        }, function(err) {
          if (err) return cb(err);
          var data = resMsg('00', '注册成功')
          res.json(data);
        })
      }
    ], function(err) {
      next(err);
    })
  })
}

/**
 * 重置密码
 * 入参
 * {
 *   account: '账号',
 *   safeCode: '安全码',
 *   newPassword: '新密码' 
 * }
 */
exports.resetPassword = function(req, res, next) {
  var account = req.body.account;
  var safeCode = req.body.safeCode;
  var newPassword = req.body.newPassword;
  db.findOne('schemaAccount', { account: account }, function(err, item) {
    if (!item) {
      return next(new Error('账号不存在'))
    }
    if (item.safeCode !== safeCode) {
      return next(new Error('安全码错误'))
    }
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) {
        return next(err)
      }
      //  生成hash密码
      bcrypt.hash(newPassword, salt, null, function(err, hash) {
        if (err) return next(err)
        db.update('schemaAccount', { _id: item._id }, { password: hash, salt: salt }, function(err, result) {
          if (err) {
            return next(err);
          }
          res.send('修改成功');
        })
      })
    })
  })
}

/**
 * 修改密码
 * 入参
 * {
 *   oldPassword: '旧密码',
 *   newPassword: '新密码'
 * }
 */
exports.updatePassword = function(req, res, next) {

}

/**
 * 获取当前用户信息
 * /api/user/getmsg
 * {}
 * return 
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
    res.json('请先登陆')
  }
}

/**
 * 获取用户列表
 * /api/user/list
 * {}
 * return 
 * {
 *   code:"",    状态码
 *   message:"", 状态信息 
 *   data:""
 * }
 */
exports.list = function(req, res, next) {
    db.find('schemaAccount', {}, { _id: 0, __v: 0 }, function(err, items) {
      if (err) return next(err);
      var data = resMsg('00', '查询所有用户成功', items)
      res.json(data);
    })
  }
  /**
   * 获取注册用户数量
   * /api/user/count
   * {}
   * return 
   * {
   *   code:"",    状态码
   *   message:"", 状态信息 
   *   data:""
   * }
   */
exports.count = function(req, res, next) {
  db.count('schemaAccount', {}, function(err, count) {
    if (err) return next(err);
    var data = resMsg('00', '查询所有用户成功', count)
    res.json(data);
  })
}
