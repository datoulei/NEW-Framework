var express = require('express');
var router = express.Router();
var path = require('path');
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var assetsPath = path.resolve(__dirname, '../assets/src');

router.get('/', (req, res, next) => {
  if (!__DEVELOPMENT__) {
    var App = require(path.join(assetsPath, 'index/index.entry'));
    var html = ReactDOMServer.renderToString(App);
    res.locals.body = html;
  }
  res.render('index');
});

module.exports = router;
