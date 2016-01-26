import ReactDom from 'react-dom';
import React from 'react';
import App from './components/App';
import jss from 'jss';

// configure jss
jss.use(require('jss-nested')());
jss.use(require('jss-vendor-prefixer')());

ReactDom.render(React.createElement(App), 
    document.getElementById('app-root'));
