var mongoose = require('mongoose');
mongoose.Promise = Promise;

mongoose.connection.on('connected', function (err) {
    if (err) console.log('Database connection failure');
});

mongoose.connection.on('error', function (err) {
    console.log('Mongoose connected error ' + err);
});

mongoose.connection.on('disconnected', function () {
    console.log('Mongoose disconnected');
});


//mongoose.connect('mongodb://localhost/hangaoke');
try {
    mongoose.connect('mongodb://localhost/hangaoke',{
  server: {
  	auto_reconnect: true,
    // poolSize: 10,
    socketOptions: {
      socketTimeoutMS: 0,
      connectTimeoutMS: 0
    }
  }
}); //- starting a db connection
}catch(err) {
    mongoose.createConnection('mongodb://localhost/hangaoke',
    {
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
var schemaArticals = new mongoose.Schema({
	title:String,
  type:String,
	content:String,
  zan:Number,
  view:Number,
  date:String

},{
    versionKey: false // You should be aware of the outcome after set to false
})

var schemaAccount = new mongoose.Schema({
	account:String,
	password:String,
	name:String,
	icon:String,
  action:String
},{
    versionKey: false // You should be aware of the outcome after set to false
})
exports.articals = mongoose.model('articals' , schemaArticals);
exports.accounts = mongoose.model('accounts' , schemaAccount);