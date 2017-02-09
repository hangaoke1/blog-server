var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/hangaoke');
try {
    mongoose.connect('mongodb://localhost/hangaoke'); //- starting a db connection
}catch(err) {
    mongoose.createConnection('mongodb://localhost/hangaoke'); //- starting another db connection
}
var schema = new mongoose.Schema({
	account:String,
	password:String,
	name:String
},{
    versionKey: false // You should be aware of the outcome after set to false
})
module.exports = mongoose.model('accounts' , schema);