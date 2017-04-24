console.log('DB模块引用');
var mongoose = require('mongoose');
var db;
mongoose.Promise = Promise;

mongoose.connection.on('connected', function(err) {
  if (err) console.log('Database connection failure');
});

mongoose.connection.on('error', function(err) {
  console.log('Mongoose connected error ' + err);
});

mongoose.connection.on('disconnected', function() {
  console.log('Mongoose disconnected');
});


//mongoose.connect('mongodb://localhost/hangaoke');
try {
  db = mongoose.connect('mongodb://localhost/hangaoke', {
    server: {
      auto_reconnect: true,
      // poolSize: 10,
      socketOptions: {
        socketTimeoutMS: 0,
        connectTimeoutMS: 0
      }
    }
  }); //- starting a db connection
} catch (err) {
  db = mongoose.createConnection('mongodb://localhost/hangaoke', {
    server: {
      auto_reconnect: true,
      // poolSize: 10,
      socketOptions: {
        socketTimeoutMS: 0,
        connectTimeoutMS: 0
      }
    }
  }); //- starting another db connection
}

// 表schemaArticals , schemaAccount
var config = {
  schemaArticals: {
    title: String,
    type: String,
    content: String,
    zan: Number,
    view: Number,
    date: String
  },
  schemaAccount: {
    account: String,
    password: String,
    name: String,
    icon: String,
    action: String,
    safeCode: String,
    salt: String
  }
}
var DB = function() {
    this.mongoClient = {};
    this.config = config;
  }
  //  返回对应表（collection）实例
DB.prototype.getConnection = function(table_name) {
    //  没有table_name入参
    if (!table_name) {
      return;
    }
    //  配置中没有对应的表
    if (!this.config[table_name]) {
      return;
    }
    //  如果mongoClient中已经有对应表的实例 直接返回该实例
    var client = this.mongoClient[table_name];
    if (!client) {
      //构建表结构
      var nodeSchema = new mongoose.Schema(this.config[table_name],{versionKey:false});

      //构建model
      client = mongoose.model(table_name, nodeSchema);

      //将对应表model存储到DB的mongoClient属性中
      this.mongoClient[table_name] = client;
    }
    return client;
  }
  /**
   * 保存数据
   * @param table_name 表名
   * @param fields 表数据
   * @param callback 回调方法
   */
DB.prototype.save = function(table_name, fields, callback) {
    if (!fields) {
      if (callback) callback({ msg: 'Field is not allowed for null' });
      return false;
    }
    //判断save记录是否合法
    var err_num = 0;
    for (var i in fields) {
      if (!this.config[table_name][i]) err_num++;
    }
    if (err_num > 0) {
      if (callback) callback({ msg: 'Wrong field name' });
      return false;
    }
    var node_model = this.getConnection(table_name);
    var mongooseEntity = new node_model(fields);
    mongooseEntity.save(function(err, res) {
      if (err) {
        if (callback) callback(err);
      } else {
        if (callback) callback(null, res);
      }
    });
  }
  /**
   * 更新数据
   * @param table_name 表名
   * @param conditions 更新需要的条件 {_id: id, user_name: name}
   * @param update_fields 要更新的字段 {age: 21, sex: 1}
   * @param callback 回调方法
   */
DB.prototype.update = function(table_name, conditions, update_fields, callback) {
  if (!update_fields || !conditions) {
    if (callback) callback({ msg: 'Parameter error' });
    return;
  }
  var node_model = this.getConnection(table_name);
  node_model.update(conditions, { $set: update_fields }, { multi: true, upsert: true }, function(err, res) {
    if (err) {
      if (callback) callback(err);
    } else {
      if (callback) callback(null, res);
    }
  });
};
/**
 * 更新数据方法(带操作符的)
 * @param table_name 数据表名
 * @param conditions 更新条件 {_id: id, user_name: name}
 * @param update_fields 更新的操作符 {$set: {id: 123}}
 * @param callback 回调方法
 */
DB.prototype.updateData = function(table_name, conditions, update_fields, callback) {
  if (!update_fields || !conditions) {
    if (callback) callback({ msg: 'Parameter error' });
    return;
  }
  var node_model = this.getConnection(table_name);
  node_model.findOneAndUpdate(conditions, update_fields, { multi: true, upsert: true }, function(err, data) {
    if (callback) callback(err, data);
  });
};
/**
 * 删除数据
 * @param table_name 表名
 * @param conditions 删除需要的条件 {_id: id}
 * @param callback 回调方法
 */
DB.prototype.remove = function(table_name, conditions, callback) {
  var node_model = this.getConnection(table_name);
  node_model.remove(conditions, function(err, res) {
    if (err) {
      if (callback) callback(err);
    } else {
      if (callback) callback(null, res);
    }
  });
};
/**
 * 查询数据
 * @param table_name 表名
 * @param conditions 查询条件
 * @param fields 待返回字段
 * @param callback 回调方法
 */
DB.prototype.find = function(table_name, conditions, fields, callback) {
  var node_model = this.getConnection(table_name);
  node_model.find(conditions, fields || null, {}, function(err, res) {
    if (err) {
      callback(err);
    } else {
      callback(null, res);
    }
  });
};

/**
 * 查询单条数据
 * @param table_name 表名
 * @param conditions 查询条件
 * @param callback 回调方法
 */
DB.prototype.findOne = function(table_name, conditions, callback) {
  var node_model = this.getConnection(table_name);
  node_model.findOne(conditions, function(err, res) {
    if (err) {
      callback(err);
    } else {
      callback(null, res);
    }
  });
};

/**
 * 根据_id查询指定的数据
 * @param table_name 表名
 * @param _id 可以是字符串或 ObjectId 对象。
 * @param callback 回调方法
 */
DB.prototype.findById = function(table_name, _id, callback) {
  var node_model = this.getConnection(table_name);
  node_model.findById(_id, function(err, res) {
    if (err) {
      callback(err);
    } else {
      callback(null, res);
    }
  });
};

/**
 * 返回符合条件的文档数
 * @param table_name 表名
 * @param conditions 查询条件
 * @param callback 回调方法
 */
DB.prototype.count = function(table_name, conditions, callback) {
  var node_model = this.getConnection(table_name);
  node_model.count(conditions, function(err, res) {
    if (err) {
      callback(err);
    } else {
      callback(null, res);
    }
  });
};

/**
 * 查询符合条件的文档并返回根据键分组的结果
 * @param table_name 表名
 * @param field 待返回的键值
 * @param conditions 查询条件
 * @param callback 回调方法
 */
DB.prototype.distinct = function(table_name, field, conditions, callback) {
  var node_model = this.getConnection(table_name);
  node_model.distinct(field, conditions, function(err, res) {
    if (err) {
      callback(err);
    } else {
      callback(null, res);
    }
  });
};

/**
 * 连写查询
 * @param table_name 表名
 * @param conditions 查询条件 {a:1, b:2}
 * @param options 选项：{fields: "a b c", sort: {time: -1}, limit: 10}
 * @param callback 回调方法
 */
DB.prototype.where = function(table_name, conditions, options, callback) {
  var node_model = this.getConnection(table_name);
  node_model.find(conditions)
    .select(options.fields || '')
    .sort(options.sort || {})
    .limit(options.limit || {})
    .exec(function(err, res) {
      if (err) {
        callback(err);
      } else {
        callback(null, res);
      }
    });
};

module.exports = new DB();
