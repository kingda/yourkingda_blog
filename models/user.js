var mongodb = require('mongodb').Db;
var settings = require('../settings');
function User (user) {
	this.name=user.name;
	this.password=user.password;
	this.email=user.email;
};

module.exports=User;
//save user message
User.prototype.save = function(callback){
	//要存入数据库的用户文档
	var user = {
   name:this.name,
   password:this.password,
   email:this.email
	};
	//打开数据库
	mongodb.connect(settings.url,function(err,db){
     if(err){
     	return callback(err);//返回错误信息
     }
     //读取users集合
     db.collection('users',function (err,collection){
       if(err)
       {
       	db.close();
       	return callback(err);
       }
       //将用户插入User集合
       collection.insert(user,{safe:true},function (err,user){
       	db.close();
       	if(err){
       		return callback(err);//错误返回err信息
       	}
       	callback(null,user[0]);//成功！err 为null,并返回存储后的用户文档
       });
     });
	});
}

//读取用户信息
User.get = function  (name,callback) {
//open database
mongodb.connect(settings.url,function  (err,db) {
	if(err){
		return callback(err);
	}

//read users collenction
db.collection('users',function (err,collection) {
	if(err){
		db.close();
		return callback(err);
	}
	//find users'name in a document
	collection.findOne({name:name},function (err,user){
		db.close();
		if(err){
			return callback(err);
		}
		callback(null,user);
	});
});
});
};