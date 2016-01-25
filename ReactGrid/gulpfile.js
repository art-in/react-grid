/// <binding ProjectOpened='default' />
var gulp = require('gulp');
var webpack = require('webpack');
var run = require('run-sequence');
var gutil = require('gulp-util');
var del = require('del');

var config = require('./gulpfile.config');

var isDev = false;

gulp.task('clean', function () {
    return del(config.paths.target + '**/*');
});

gulp.task('build', ['clean'], function () {

    var devtool;
    var plugins = [];

    if (isDev) {
        // fast on incremental builds
        devtool = 'eval-source-map';
    } else {
        devtool = 'source-map';
        plugins.push(new webpack.optimize.UglifyJsPlugin({ compress: false }));
    }

    webpack({
        context: config.paths.sources.scripts,
        entry: [
            config.paths.sources.babel_polyfill,
            config.paths.sources.jquery,
            config.paths.sources.bootstrap_webpack,
            config.paths.sources.scripts + config.paths.sources.entryModule
        ],
        plugins: plugins.concat([
            new webpack.ProvidePlugin({
                'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
            })
        ]),
        module: {
            preLoaders: [
                {
                    test: /\.(js|jsx)$/,
                    loaders: ['eslint'],
                    include: [config.paths.sources.scripts],
                    exclude: [/vendor/]
                }
            ],
            loaders: [
                {
                    test: /\.(js|jsx)$/,
                    loader: 'babel-loader',
                    exclude: [
                        /node_modules/
                    ],
                    query: {
                        plugins: [
                            'transform-class-properties',
                            'transform-decorators-legacy'
                        ],
                        presets: ['es2015', 'stage-0', 'react']
                    }
                },
                
                { test: /\.css$/, loader: "style-loader!css-loader" },

                // bootstrap
                { test: /jquery\.js$/, loader: 'expose?jQuery' },
                { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?mimetype=application/font-woff' },
                { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?mimetype=application/octet-stream' },
                { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?mimetype=application/octet-stream' },
                { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?mimetype=image/svg+xml' }
            ],
            noParse: []
        },
        eslint: {
            emitWarning: true
        },
        resolveLoader: {
            root: config.paths.nodeModules
        },
        resolve: {
            alias: {}
        },
        devtool: devtool,
        watch: isDev,
        output: {
            path: config.paths.target,
            filename: config.paths.targetFilename
        }
    }, function (err, stats) {
        if (err) {
            console.log(err);
            return;
        }

        gutil.log("[webpack]", stats.toString({ colors: true, chunks: false }));
        gutil.log("Output: " + gutil.colors.magenta(config.paths.target));
    });
});

gulp.task('watch', function () {
    isDev = true;

    run(['build']);
});

gulp.task('default', ['watch']);