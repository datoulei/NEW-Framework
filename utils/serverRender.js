var path = require('path');
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var createStore = require('redux').createStore;
var Provider = require('react-redux').Provider;
var srcPath = path.resolve(__dirname, '../assets/src');
var rootReducer = require(path.join(srcPath, 'redux/reducers'));

module.exports = function (componentClass, state) {
  if (__DEVELOPMENT__) {
    // Do not cache webpack stats: the script file would change since
    // hot module replacement is enabled in the development env
    webpackIsomorphicTools.refresh();
  }
  var store = createStore(rootReducer, state);
  var component = React.createElement(componentClass);
  return ReactDOMServer.renderToString(<Provider store={store}>{component}</Provider>);
}
