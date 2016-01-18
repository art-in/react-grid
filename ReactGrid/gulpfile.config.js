var path = require('path');

module.exports = {
    paths: {
        sources: {
            scripts: path.join(__dirname, 'Scripts/'),
            entryModule: 'boot.js',

            // additional resources
            babel_polyfill: path.join(__dirname, './node_modules/babel-polyfill/'),
            jquery: path.join(__dirname, './node_modules/jquery/dist/jquery.js'),
            bootstrap_webpack: path.join(__dirname, './node_modules/bootstrap-webpack/')
        },

        // vendor node modules
        nodeModules: path.join(__dirname, './node_modules/'),

        // target folder
        target: path.join(__dirname, 'Scripts/build/'),
        targetFilename: 'app.bundle.js'
    }
};