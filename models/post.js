var mongodb = require('mongodb').Db;
var markdown = require('markdown').markdown;
var ObjectID = require('mongodb').ObjectID;
var settings = require('../settings');
function Post(name,title,post,type) {
	this.name=name;
	this.title=title;
	this.post=post;
   this.type=type;
}
module.exports = Post;

//存储一篇文章及相关信息
Post.prototype.save = function(callback){
	var date = new Date();
	var time = {
      date:date,
      year:date.getFullYear(),
      month:date.getFullYear() + "-" + (date.getMonth()+1),
      day:date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate(),
      minute:date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + "" + date.getHours() + ":" + (date.getMinutes()<10 ? '0' + date.getMinutes() :  date.getMinutes())
	};



//要存入数据库的文档
var post = {
name:this.name,
time:time,
title:this.title,
post:this.post,
type:this.type
};

//打开数据库
mongodb.connect(settings.url,
function  (err,db) {
	if(err){
		return callback(err);
	}
	//读取post集合
	db.collection('posts',function (err,collection){
		if(err){
			db.close();
			return callback(err);
		}
		collection.insert(post,{
			safe:true
		},function(err){
			db.close();
			if(err){
				return callback(err);
			}
			callback(null);
		});
	});

});
};

Post.getAll= function(name,type,callback){

	mongodb.connect(settings.url,
function(err,db){
   if(err){
   	return callback(err);
   }
   db.collection('posts',function(err,collection){
   	if(err){
   		db.close();
   		return callback(err);
   	}
   	var query={};
   	if(name){
   		query.name=name;
   	}
      if(type){
         query.type=type;
      }
      
   	collection.find(query).sort({time:-1}).toArray(function(err,docs){
   	
   		if(err)
   		{
               db.close();
   			return callback(err);
   		}
   		docs.forEach(function(doc){
   			doc.post = markdown.toHTML(doc.post);
   		});
   		callback(null,docs);
         
   	});
   });

});
};

//获取一篇文章
Post.getOne = function(name,day,title,callback){
  
//打开数据库
mongodb.connect(settings.url,
function(err,db){
   if(err){
      return callback(err);
   }
   db.collection('posts',function(err,collection){
      if(err){
         db.close();
         return callback(err);
      }
      collection.findOne({
         "name":name,
         "time.day":day,
         "title":title
      },function(err,doc){
         
         if(err){
            db.close();
            return callback(err);

         }
         if(doc)
         doc.post = markdown.toHTML(doc.post);
         callback(null,doc);
      });
   });
});
};

Post.getOneById = function(_id,callback){
  
//打开数据库
mongodb.connect(settings.url,
function(err,db){
   if(err){
      return callback(err);
   }
   db.collection('posts',function(err,collection){
      if(err){
         db.close();
         return callback(err);
      }
      try{var id=new ObjectID(_id);}
      catch( e){
         return callback(err);
      }
      collection.findOne({
         "_id":new ObjectID(_id)
      },function(err,doc){
         
         if(err){
            db.close();
            return callback(err);

         }
         
         callback(null,doc);
      });
   });
});
};


Post.update = function(_id,post,callback){
   
//打开数据库
mongodb.connect(settings.url,
function(err,db){
   if(err){
      return callback(err);
   }
   db.collection('posts',function(err,collection){
      if(err){
         db.close();
         return callback(err);
      }
      
      collection.update({
         "_id":new ObjectID(_id)
      },{
         $set:{post:post}
      },function(err){
         
         if(err){
            db.close();
            return callback(err);

         }
         
         callback(null);
      });
   });
});
};

Post.remove = function(_id,callback){
   
//打开数据库
mongodb.connect(settings.url,
function(err,db){
   if(err){
      return callback(err);
   }
   db.collection('posts',function(err,collection){
      if(err){
         db.close();
         return callback(err);
      }
      
      collection.remove({
         "_id":new ObjectID(_id)
      },{
         w:1
      },function(err){
         
         if(err){
            db.close();
            return callback(err);

         }
         
         callback(null);
      });
   });
});
};

//一次获取十篇文章
Post.getTen = function(name,type,page,callback) {
  //打开数据库
  mongodb.connect(settings.url,function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('posts', function (err, collection) {
      if (err) {
        db.close();
        return callback(err);
      }
      var query = {};
      if (name) {
        query.name = name;
      } if (type) {
        query.type = type;
      } 
      //使用 count 返回特定查询的文档数 total
      collection.count(query, function (err, total) {
        //根据 query 对象查询，并跳过前 (page-1)*10 个结果，返回之后的 10 个结果
        collection.find(query, {
          skip: (page - 1)*9,
          limit: 9
        }).sort({
          time: -1
        }).toArray(function (err, docs) {
          db.close();
          if (err) {
            return callback(err);
          }
          //解析 markdown 为 html
          docs.forEach(function (doc) {
            doc.post = markdown.toHTML(doc.post);
          });  
          callback(null, docs, total);
        });
      });
    });
  });
};

//返回通过标题关键字查询的所有文章信息
Post.search = function(keyword, callback) {
  mongodb.connect(settings.url,function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        db.close();
        return callback(err);
      }
      var pattern = new RegExp("^.*" + keyword + ".*$", "i");
      collection.find({
        "title": pattern
      }, {
        "name": 1,
        "time": 1,
        "title": 1
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        db.close();
        if (err) {
         return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};