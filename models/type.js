var mongodb = require('mongodb').Db;
var ObjectID = require('mongodb').ObjectID;
var settings = require('../settings');
function Type (number,title,text) {
	this.number=number;
	this.text=text;
  this.title=title;
}
module.exports=Type;
Type.prototype.save = function(callback) {
  db.close();
	var type={
     number:this.number,
     title:this.title,
     text:this.text

	};
	mongodb.connect(settings.url,function(err,db){

    if(err)
    {
    	console.log("mongodb open failed");
    	return callback(err);
    }
    db.collection('types',function(err,collection){
        if(err){
        	db.close();
        	return callback(err);
        }
        collection.insert(type,{safe:true},function(err){

     if(err)
     {
     	db.close();
     	return callback(err);
     }
     callback(null);

        });

    });

	});
};



Type.getAll= function(number,callback){
db.close();
  mongodb.connect(settings.url,
function(err,db){
   if(err){
    return callback(err);
   }
   db.collection('types',function(err,collection){
    if(err){
      db.close();
      return callback(err);
    }
    var query={};
    if(number){
      query.number=number;
    }
      
    collection.find(query).sort({number:-1}).toArray(function(err,docs){
    
      if(err)
      {
        db.close();
        return callback(err);
      }
      
      callback(null,docs);
         
    });
   });

});
};

Type.remove= function(_id,callback){
db.close();
  mongodb.connect(settings.url,
function(err,db){
   if(err){
    return callback(err);
   }
   db.collection('types',function(err,collection){
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