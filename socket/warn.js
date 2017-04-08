var socketio = require('socket.io');
var warn;
var redis = require('../redis/redis.js').redis;
global.io;
exports.listen = function(server) {
  global.io = socketio(server);
  // console.log(io.adapter);
  var warn = global.io.of('/warnTips');
  warn.on('connection', function(socket) {
    redis.subscribe('warn',function(err,count) {
      console.log('current count:'+ count);
    })
    redis.on('message',function(channel,message){
      console.log('Receive message %s from channel %s', message, channel);
      socket.emit('warn','警告警告')
    })
  });
}
