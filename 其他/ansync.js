var async = require('async');

async.waterfall([
	function(cb){
		setTimeout(function(){
			cb(null);
		},1000)
	},
	function(cb){
		console.log('hahah');
		cb(null)
	},
	function(cb){
		console.log('oooo')
		cb(null)
	}
	],function(err,res){
	console.log(err);
	console.log('jjjj')
})