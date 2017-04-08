// redis
var ioRedis = require('ioredis');
var redis = new ioRedis();
//  注意是不同的redis实例
var pub = new ioRedis();
// var pub = redis;
exports.redis = redis;
exports.pub = pub;