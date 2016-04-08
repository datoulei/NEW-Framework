const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');
const fs = require('fs');
const routes = require('./routes');
const extendRender = require('./utils/extendRender');

const app = express();
// 设置调试模式
app.set('debug', app.get('env') === 'development');

// 初始化 state
app.locals.initialState = {};
app.locals.assets = {};
app.locals.body = '';
// 百度统计代码
// if (app.get('env') === 'development') {
//   app.locals.BAIDU_CODE = ''
// } else {
//   app.locals.BAIDU_CODE = config.BAIDU_CODE;
// }



// 模板引擎设置
if (app.get('debug')) {
  app.set('views', path.join(__dirname, 'assets/src'));
} else {
  app.set('views', path.join(__dirname, 'assets/dist'));
}
app.set('view engine', 'ejs');

// 开启代理
// if (app.get('debug')) {
//   // 调试环境开启接口代理
//   var proxyConfig = config.API_PROXY_CONFIG;
//   // 配置接口代理路径
//   var context = proxyConfig.path;
//   // 配置代理选项
//   var options = {
//     target: proxyConfig.host,
//     changeOrigin: proxyConfig.changeOrigin,
//     pathRewrite: proxyConfig.pathRewrite
//   };
//
//   if (config.NODE_ENV_MOCK) {
//     // 开启mock数据
//     app.use(require('./middleware/mockMiddleware'));
//   }
//
//   // 创建代理中间件
//   var proxy = require('http-proxy-middleware')(context, options);
//   app.use(proxy);
// }

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
if (!app.get('debug')) {
  app.use('/static', express.static(path.join(__dirname, 'assets/dist')));
}
app.use(compression());

// 扩展extend方法
extendRender(app);
// 路由处理
app.use('/', routes);

// 404错误处理
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// 异常处理

// 开发环境，500错误处理和错误堆栈跟踪
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500).send(err.toString());
  });
}

// 生产环境，500错误处理
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send(err.toString());
});

// 启动express服务
let PORT = parseInt(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log('启动服务. 端口号:', PORT);
});
