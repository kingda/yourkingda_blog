/* GET home page. */
var crypto = require('crypto');
var fs = require('fs');
User = require('../models/user.js');
Post = require('../models/post.js');
Type = require('../models/type.js');
var URL = require('url');
var goodCount=0;

module.exports=function (app) {

     /*主页的设置*/
	app.get('/lovexiongbaobao',function (req,res){
     var page = req.query.p ? parseInt(req.query.p) : 1;
		Post.getTen(null,null,page,function(err,posts,total){
			if(err){
				posts={};
			}
			res.render('index', { 
		 	title: '主页',
		 	user: req.session.user,
		 	posts:posts,
      page:page,
      isFirstPage:(page - 1) == 0,
      isLastPage:((page-1)*10+posts.length) == total,
		 	success: req.flash('success').toString(),
		 	error: req.flash('error').toString() 
		 });
		});
		
	});

    /*注册的get页面*/
    app.get('/reg',checkNotLogin);
	app.get('/reg',function (req,res){

    User.get("kingda",function(err,user){
   if(user){

    res.redirect('/lovexiongbaobao');
   }

    res.render('reg', { 
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString() 
       });

    });
		 
	});

    /*注册的post页面*/
    app.post('/reg',checkNotLogin);
	app.post('/reg',function (req,res){
	//注册的post操作
   var name= req.body.name,
   password=req.body.password,
   password_re=req.body['password-repeat'],
   email=req.body.email;

	//检验用户两次输入的密码是否一致
	if(password_re != password)
	{
		req.flash('error','两次输入的密码不一致');
		return res.redirect('/reg');
	}
	//check name
	if(name.length==0||password.length==0||password_re.length==0||email.length==0){
		req.flash('error','信息不完整');
		return res.redirect('/reg');
	}
	// made password md5
var md5=crypto.createHash('md5'),
password=md5.update(req.body.password).digest('hex');
     var newUser = new User({
	       name:req.body.name,
	       password:password,
	      email:req.body.email
});
// check name
User.get(newUser.name,function(err,user){
if(user){
	req.flash('error','dear~该用户已经注册啦~');
	return res.redirect('/reg');
}
newUser.save(function(err,user){
	if(err){
		req.flash('error',err);
		return res.redirect('/reg');
	}
	req.session.user=user;
	req.flash('success','注册成功');
	res.redirect('/');//注册成返回主页
   });
    });
	});/*end register_post*/


    /*发表文章的get控制*/
    app.get('/post',checkLogin);
	app.get('/post',function (req,res){

    Type.getAll(null,function(err,docs){
  if(err){
    console.log("index.js app.get post");
  }

  res.render('post', { 
      title: '发表',
      user: req.session.user,
      types:docs,
      success: req.flash('success').toString(),
      error: req.flash('error').toString() 
       });

    });
		 
	});


	/*发表文章的post控制*/
	app.post('/post',checkLogin);
	app.post('/post',function (req,res){
	var currentUser = req.session.user;
	var post=new Post(currentUser.name,req.body.title,req.body.post,req.body.type);
	post.save(function(err){
      if(err){
      	req.flash('error',err);
      	return res.redirect('/');
      }
      req.flash('success','发表成功!');
      res.redirect('/lovexiongbaobao');
	});
	});

	/*用户注销的get控制*/
	app.get('/logout',checkLogin);
	app.get('/logout',function (req,res){
		req.session.user=null;
		req.flash('success','登出成功');
		res.redirect('/lovexiongbaobao');
	});

    /*用户上传功能的get控制*/
    app.get('/upload',checkLogin);
    app.get('/upload',function(req,res){
    	res.render('upload',{
         title:'文件上传',
         user:req.session.user,
         success:req.flash('success').toString(),
         error:req.flash('error').toString()
    	});
    });

    /*用户上传功能的post控制*/
    app.post('/upload',function(req,res){
     for(var i in req.files){
     	if(req.files[i].size==0){
     		fs.unlinkSync(req.files[i].path);
     		console.log('Successfully removed an empty file!');
     	}else{
     		var target_path = './public/images/'+req.files[i].name;
     		fs.renameSync(req.files[i].path,target_path);
     		console.log('Successfully rename a file');
     	}

     }
     req.flash('success','文件上传成功');
     res.redirect('/upload');
    });
	/*用户登录的get控制*/
	app.get('/login',checkNotLogin);
	app.get('/login',function (req,res){
		 res.render('login', { 
		 	title: '登陆',
		 	user: req.session.user,
		 	success: req.flash('success').toString(),
		 	error: req.flash('error').toString() 
		 	 });
	});

    /*用户登录的post控制*/
    app.post('/login',checkNotLogin);
	app.post('/login',function (req,res){
		var md5 = crypto.createHash('md5'),
		password=md5.update(req.body.password).digest('hex');
		User.get(req.body.name,function(err,user){
        if(!user){
        	req.flash('error','用户不存在');
        	return res.redirect('/login');
        }
        if(user.password != password){
        	req.flash('error','密码错误');
        	return res.redirect('/login');
        }
        req.session.user=user;
        req.flash('success','登陆成功');
        res.redirect('/lovexiongbaobao');
		});
	});
   /*  获取用户的所有文章*/
   app.get('/u/:name',function(req,res){
    User.get(req.params.name,function(err,user){
   if(!user){
   	req.flash('error','用户不存在');
   	return res.redirect('/lovexiongbaobao');
   }
   Post.getAll(user.name,function(err,posts){
     if(err){
     	req.flash('error',err);
     	return res.redirect('/lovexiongbaobao');
     }
     res.render('user',{
          title:user.name,
          posts:posts,
          user:req.session.user,
          success:req.flash('success').toString(),
          error:req.flash('error').toString()
     });
   });
    });
   });

   /* 获取文章页面*/
   app.get('/u/:name/:day/:title',function(req,res){
    Post.getOne(req.params.name,req.params.day,req.params.title,function(err,post){
    	if(err){
    		req.flash('error',err);
    		return res.redirect('/lovexiongbaobao');
    	}
    	res.render('article',{
           title:req.params.title,
           post:post,
           user:req.session.user,
           success:req.flash('success').toString(),
          error:req.flash('error').toString()
    	});
    });
   });

	/*页面权限控制*/
	function checkLogin (req,res,next) {
		if(!req.session.user){
			req.flash('error','未登录');
			res.redirect('/login');
		}
		next();
	}
	function checkNotLogin (req,res,next) {
		if(req.session.user){
			req.flash('error','已登陆');
			res.redirect('back');
		}
		next();
	}
/* 增加编辑功能 */
app.get('/edit/:_id',checkLogin);
app.get('/edit/:_id',function(req,res){

Post.getOneById(req.params._id,function(err,post){
        
        res.render("article",{
        title:"edit",
        post:post,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
})
});
});

app.post('/edit/:_id',checkLogin);
app.post('/edit/:_id',function(req,res){

var currentUser=req.session.uer;
Post.update(req.params._id,req.body.post,function(err){
  var url='/edit/'+req.params._id;

if(err){
  req.flash('error',err);
  return res.redirect(url);
}
req.flash('success','修改成功');
res.redirect(url);

});
});

app.get('/remove/:_id',checkLogin);
app.get('/remove/:_id',function(req,res){

var currentUser=req.session.uer;
Post.remove(req.params._id,function(err){
  
if(err){
  req.flash('error',err);
  return res.redirect('back');
}
req.flash('success','删除成功');
res.redirect('/lovexiongbaobao');

});
});




	/*for kingda_index*/
	app.get('/',function(req,res){

    res.render('kingda_index');
	});


	app.get('/articles',function(req,res){
    Post.getAll(null,null,function(err,posts_1){
     if(err){
     	console.log("在index.js 里面渲染/article时错误");
     }
      Post.getAll(null,"2",function(err,posts_2){
     if(err){
     	console.log("在index.js 里面渲染/article时错误");
     }
     Type.getAll(null,function(err,types){
       if(err){
      console.log("在index.js 里面渲染/article时错误");
     }

    res.render('kingda_article',{
        passages:posts_1,
        goods:posts_2,
        types:types
     }); 
   
     });
      
   });
     });
	});

/*for kingda_type*/
app.get('/kingda_type',checkLogin);
app.get('/kingda_type',function(req,res){
 Type.getAll(null,function(err,types){

 if(err){
      console.log("在index.js 里面渲染/kingda_type时错误");
    }

    res.render('kingda_type',{
      title: '主页类型修改',
      user: req.session.user,
      types:types,
      success: req.flash('success').toString(),
      error: req.flash('error').toString() 
});

 });


});

app.post('/kingda_type',checkLogin);
  app.post('/kingda_type',function (req,res){
  Type.getAll(null,function(err,types){
    if(err){
      console.log("在index.js 里面渲染/kingda_type时错误");
    }

    var count=types.length;
    console.log(count);
 var type = new Type(count+1,req.body.type_title,req.body.type_text);
  type.save(function(err){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      req.flash('success','修改类型成功!');
      res.redirect('/kingda_type');
  });


  }) 
  });
app.get('/remove_type/:_id',checkLogin);
app.get('/remove_type/:_id',function(req,res){
   Type.remove(req.params._id,function(err){
   if(err){
    console.log("type remove failed");
   }
   res.redirect('/kingda_type');

   })
});



  /*for kingda_articles*/

app.get('/kingda_articles',function(req,res){
res.render("kingda_articles");
});

app.get('/articles/:type',function(req,res){
  var type=req.params.type+"";
  var page = req.query.p ? parseInt(req.query.p) : 1;
Post.getTen(null,type,page,function(err,posts,total){

if(err){
      console.log("在index.js 里面渲染/article时错误");
      posts = [];
  }
Type.getAll(null,function(err,types){

res.render("kingda_articles",{

    posts:posts,
    types:types,
    number:type,
    page:page,
    isFirstPage: (page - 1) == 0,
    isLastPage: ((page - 1) * 9 + posts.length) == total,

});

});

});


});



/*for kingda's a blog*/


app.get("/blogs/:_id",function(req,res){
   
Post.getOneById(req.params._id,function(err,post){
  if(err){
    console.log("app.get a blog error");
    res.redirect("/404");
  }
  if(!post){
    res.redirect("/404");
  }
   req.setEncoding('utf-8');
  res.render("kingda_blog",{
     url:req.url,
     post:post
  });
});


});

/*for kingda's contact*/

app.get('/contact',function(req,res){
res.render("kingda_contact",{
goodCount:goodCount

});

});


app.get('/good',function(req,res){
    goodCount++;
    res.end(JSON.stringify({testkey:goodCount}));

});

app.get('/lovexiongbaobao/search', function (req, res) {
  Post.search(req.query.keyword, function (err, posts) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('/');
    }
    res.render('search', {
      title: "SEARCH:" + req.query.keyword,
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

app.get('/search', function (req, res) {
  Post.search(req.query.keyword, function (err, posts) {
    if (err) {
      return res.redirect('/');
    }
    res.render('kingda_search', {
      posts: posts,
      
    });
  });
});

app.get('/back',function(req,res){
   res.redirect('back');
});


app.get('*', function(req, res) {  
    console.log('404 handler..')  
    res.render('404', {  
        status: 404,  
        title: 'NodeBlog',  
    });  
});





};
 
