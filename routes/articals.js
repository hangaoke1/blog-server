const Item = require('../models/db.js').articals;
exports.search = function(req,res){
	var currentPage = parseInt(req.body.page.currentPage);
	var pageSize = parseInt(req.body.page.pageSize);
	var query = Item.find({}).sort({'_id':-1});
	var pageTotal = 0;
	var pages = 0;
	Item.count({},function(err,res){
		pageTotal = res;
		pages = Math.floor(pageTotal/pageSize);
	})
	query.skip((currentPage-1)*pageSize);
		query.limit(pageSize);
		query.exec(function(err,rs){
			if(err) return next(err);
			var data = {
				code:'00',
				message:'文章加载成功',
				page:{
					pageTotal: pageTotal,
					pages:pages,
					currentPage:currentPage,
					pageSize:pageSize
				},
				data:rs
			}
			res.json(data);
		})
}

exports.add = function(req,res){
	if(req.session.user){
		if(req.session.user.action != 1){
			var data = resMsg('9993','权限不足')
			res.json(data);
			return false;
		}
		var title = req.body.title;
		var content = req.body.content;
		var type = req.body.type;
		var date = formatDateTime(new Date());
		Item.create({
			title:title,
			content:content,
			type:type,
			zan:0,
			view:0,
			date:date
		},function(err){
			if(err) return next(err);
			var data = resMsg('00','文章添加成功')
			res.json(data);
		})
	}else{
		var data = resMsg('9995','请先登陆')
		res.json(data);
	}
}


//日期转换
 function formatDateTime(date) {
    if(date){
      var y = date.getFullYear();  
      var m = date.getMonth() + 1;  
      m = m < 10 ? ('0' + m) : m;  
      var d = date.getDate();  
      d = d < 10 ? ('0' + d) : d;  
      var h = date.getHours();  
      var minute = date.getMinutes();
      var second = date.getSeconds();  
      minute = minute < 10 ? ('0' + minute) : minute;  
      second = second < 10 ? ('0' + second) : second;  
      return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;  
    }else{
      return '';
    }
};  

function resMsg(code,message,data){
	return {
		code:code,
		message:message,
		data:data||{}
	}
}