var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// 加入的
var session = require('express-session')
var { Mongoose } = require('./untils/config.js')


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
  secret: '#$#$$#',
  name:'sessionId',
  resave: false,  //为true的时候 假如有多个请求同时进行的时候，有时候就会出现第一个取到A值，第二个就改成了B值
  saveUninitialized: true, // 加大存储的利用率，允许被修改为空值
  cookie: { maxAge:1000*60*60 } // 设置时间
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api2/users', usersRouter); // 后期还要修改
app.use('/api2/admin', adminRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

Mongoose.connect();

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
