/**
 * 文件说明: 依赖加载中间件
 * 详细描述:
 * 创建者: 姜赟
 * 创建时间: 16/3/24
 * 变更记录:
 */
var path = require('path');
var fs = require('fs');

module.exports = function (app) {
  // 修改render方法
  console.log('扩展render方法');
  app._render = app.render;
  app.render = function (name, options, callback) {
    if (app.get('debug')) {
      // 匹配同名目录下的同名文件
      const filename = path.resolve(__dirname, '../', app.get('views'), name, name + '.' + app.get('view engine'));
      // console.log('filename', filename);
      const injectStyle = (err, html) => {
        // 注入style
        var stylesheet = '<link rel="stylesheet" href="[name].entry.css">'.replace('[name]', name);
        callback.call(this, err, html.replace('</head>', stylesheet + '</head>'));
      };
      if (fs.existsSync(filename)) {
        // 同名文件存在,渲染该文件
        if (__DEVELOPMENT__) {
          webpackIsomorphicTools.refresh();
        }
        var assets = webpackIsomorphicTools.assets();
        var scripts = [];
        // 加载通用代码
        scripts.push(assets.javascript['commons']);
        // 加载当前页面入口文件
        scripts.push(assets.javascript[name + '.entry']);
        Object.assign(options, {
          assets: {scripts: scripts}
        });
        app._render(filename, options, callback);
      } else {
        // 同名文件不存在,按原有逻辑渲染
        app._render(name, options, callback);
      }
    } else {
      app._render(name, options, callback);
    }
  };
};
