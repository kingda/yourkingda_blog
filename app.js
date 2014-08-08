var express = require('express');
var http = require('http');
var path = require('path');

var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash = require('connect-flash');

var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes');

var app = express();

app.set('port',process.env.PORT || 3000);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());

app.use(favicon());
app.use(logger('dev'));
app.use(express.bodyParser({
 keepExtensions:true,uploadDir:'./public/images'
}));
app.use(express.methodOverride());
app.use(cookieParser());
app.use(express.session({
      secret: settings.cookieSecret,
      cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
      url: settings.url

     
    }));
app.use(express.static(path.join(__dirname, 'public')));
// 调用路由规则
app.use(app.router);



/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});

http.createServer(app).listen(app.get('port'));
module.exports = app;
routes(app);
