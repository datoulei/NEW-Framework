import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
const reactClass = (<App/>);
if (__CLIENT__) {
  const rootElement = document.getElementById('app');
  ReactDOM.render(reactClass, rootElement);
}

if (__SERVER__) {
  module.exports = reactClass;
}
