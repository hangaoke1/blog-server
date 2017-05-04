var request = require('request');
var fs = require('fs');
console.log(__dirname);
request('https://gd3.alicdn.com/imgextra/i2/2473151493/TB2E5f8kHFlpuFjy0FgXXbRBVXa_!!2473151493.jpg').pipe(fs.createWriteStream('doodle.png'))