const express = require('express');
const app = express();
const fs = require('fs')
const path = require('path')
const favicon = require('serve-favicon');
const bodyParser = require('body-parser')
const multiparty = require('multiparty');
const cookieParser = require('cookie-parser')
const session = require('express-session');
//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials",true); //带cookies
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});


app.use(cookieParser('sessiontest'));
app.use(session({
    secret: 'sessiontest',//与cookieParser中的一致
    resave: true,
    saveUninitialized:true
}));


//模板引擎
app.set('views',path.join(__dirname + '/views'));
app.engine('.html', require('ejs').__express)
app.set('view engine', 'ejs')
app.use(favicon('./favicon.ico'))
// body 解析中间件
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
// cookie 解析中间件
app.use(cookieParser())
// 设置 express 根目录
app.use(express.static(path.join(__dirname, 'public')))


app.get('/',function(req,res){
	var Item = require('./models/account.js');
	var query = Item.find({})
	res.json('Hello world');
})
app.post('/login',function(req,res){
	const form = new multiparty.Form();
	var Item = require('./models/account.js');
	form.parse(req,function(err,fields,files){
		var account = fields.account;
		var password = fields.password;
		Item.findOne({'account':account},function(err,items){
			if(!items){
				var data = {
					code:'11',
					message:'账号不存在'
				}
				res.json(data);
				return false;
			}
			if(items.password == password){
				var user={
			        account:account,
			    }
			  	req.session.user = user;
				var data = {
					code:'00',
					message:'登陆成功'
				}
				res.json(data);
			}else{
				var data = {
					code:'11',
					message:'账号或者密码错误'
				}
				res.json(data);
			}
		})
	})
})
app.get('/logouts',function(req,res){
	if(req.session.user){
		console.log('准备销毁session')
		req.session.destroy(function(err) {
			res.json('退出成功');
		})
	}else{
		res.json('清先登陆')
	}
})
app.post('/addArticals',function(req,res){
	if(req.session.user){
		const form = new multiparty.Form();
		const Item = require('./models/articals.js');
		form.parse(req , function(err,fields,files){
			var title = fields.title;
			var content = fields.content;
			Item.create({
				title:title,
				content:content
			},function(err){
				if(err) return next(err);
				console.log('文章添加');
				res.json('文章添加成功');
			})
		})
	}else{
		res.json('请先登陆')
	}
})

app.post('/getArticals',function(req,res){
	const form = new multiparty.Form();
	const Item = require('./models/articals.js');
	form.parse(req , function(err,fields,files){
		var page = parseInt(fields.page);
		var pageSize = parseInt(fields.pageSize);
		var query = Item.find({});
		query.skip((page-1)*pageSize);
   		query.limit(pageSize);
   		query.exec(function(err,rs){
   			if(err) return next(err);
   			console.log(rs);
   			res.json(rs);
   		})
        
	})
})
app.post('/test/add',function(req,res){
	const form = new multiparty.Form();
	const Item = require('./models/account.js');
	form.parse(req , function(err,fields,files){
		var account = fields.account;
		var password = fields.password;
		var name = fields.name;
		console.log(account);
		Item.find({'account':account},function(err,items){
			if(items.length>=1){
				console.log('账号重复');
				res.json('账号重复');
			}else{
				Item.create({
					account:account,
					password:password,
					name:name
				},function(err){
					if(err) return next(err);
					console.log('插入成功')
					res.json('success')
				})
			}
		})
	})
})

app.get('/userList',function(req,res){
	const form = new multiparty.Form();
	const Item = require('./models/account.js');
	Item.find(function(err,items){
		var item = JSON.stringify(items);
		res.end(item);
	})
})
app.listen(3000);