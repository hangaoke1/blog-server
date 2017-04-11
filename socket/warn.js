var socketio = require('socket.io');
var adapter = require('socket.io-redis');
var warn;
global.user = [];
var num = 0;
// 所有app Server共享redis,sub和pub
var redis = require('../redis/redis.js').redis;
var sub = require('../redis/redis.js').sub;
var pub = require('../redis/redis.js').pub;
// 返回一个Redis构造函数
var hgk = adapter({ pubClient: pub, subClient: sub, key: 'hgk@2017', withChannelMultiplexing: true });
// redis.subscribe('hgk', function(err, count) {
//   console.log('channel count:' + count);
// })
global.io;
exports.listen = function(server) {
  io = socketio(server);
  io.adapter(hgk);
  console.log('-------------------------------分割线')
  //  io._adapter === hgk
  // console.log(io.adapter.toString());
  // io.of('/') Redis实例1 此处subscribe各个通道
  // io.of('/warnTips') Redis实例2 此处subscribe各个通道
  warn = io.of('/warnTips');
  // console.log(warn.adapter.__proto__);
  // warn.adapter 是 hgk的实例 同 io._adapter
  console.log(warn.adapter instanceof hgk)
  warn.on('connection', function(socket) {
    // 添加redis.on message事件，每增加一个socket就增加一个回掉函数
    // redis.on('message', function(channel, message) {
    //     console.log('Receive message %s from channel %s', message, channel);
    //     socket.emit('warn', 'message')
    //   })
    user.push({ account: num, socketID: socket.id });
    num += 1;
    socket.on('account', function(data) {
      console.log('save account:' + data + 'socketId:' + socket.id);
    })
    socket.on('hgk', function(data) {
      console.log(data);
      warn.emit('warn', data);
    })
    warn.adapter.remoteJoin(socket.id, 'room1', function(err) {
      if (err) { console.log('unknown id') }
      console.log('join success:' + socket.id);
    });
    warn.adapter.customHook = function(data, cb) {
      warn.to('room1').emit('warn', JSON.parse(data));
      cb('hello ' + data);
    }
    socket.on('disconnect', function() {
      for (var i = user.length - 1; i >= 0; i--) {
        if (user[i].socketID === socket.id) {
          var dis = user.splice(i, 1);
          console.log('del:' + dis);
        }
      }
      console.log('断开链接');
    })
  });
}
