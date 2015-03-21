'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

var Config = require('./config');

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var modRewrite = require('connect-modrewrite');
var rewriteRules = [
    '!\\.html|\\.xml|\\images|\\.js|\\.css|\\.png|\\.jpg|\\.woff|\\.ttf|\\.svg|\\.map /index.html [L]'
];

gulp.task('server:dist', function(done) {
    browserSync({
        port: 9000,
        notify: false,
        logPrefix: 'test.28.io',
        open: false,
        server: {
            baseDir: ['dist'],
            middleware: [
                modRewrite(rewriteRules)
            ]
        }
    }, done);
});

//run the server after having built generated files, and watch for changes
gulp.task('server:dev', function(done) {
    browserSync({
        port: 9000,
        notify: false,
        logPrefix: 'test.28.io',
        server: {
            baseDir: ['.', Config.paths.app],
            middleware: [
                modRewrite(rewriteRules)
            ]
        },
        browser: 'default'
    }, done);

    gulp.watch(Config.paths.html, reload);
    gulp.watch(Config.paths.sass, ['sass', reload]);
    gulp.watch(Config.paths.js, ['jslint', reload]);
    gulp.watch(Config.paths.json, ['jsonlint']);
    gulp.watch(Config.paths.entries, ['load-config', reload]);
});

gulp.task('server:stop', browserSync.exit);

/* jshint camelcase:false*/
//var webdriverStandalone = require('gulp-protractor').webdriver_standalone;
var webdriverUpdate = require('gulp-protractor').webdriver_update;

var Config = require('./config');

var protractorConfig = require('../tests/e2e/config/protractor-shared-conf.js');

//update webdriver if necessary, this task will be used by e2e task
gulp.task('webdriver:update', webdriverUpdate);

// Run e2e tests using protractor, make sure serve task is running.
gulp.task('test:e2e', ['webdriver:update'], function() {
    var configs = {
        travis: 'tests/e2e/config/protractor-travis-nosaucelabs-conf.js',
        local: 'tests/e2e/config/protractor-conf.js'
    };

    var configFile = Config.isOnTravis ? configs.travis : configs.local;
    var args = [];
    if(Config.isOnTravis && !Config.isOnProduction) {
        args.push('--baseUrl');
        args.push('http://' + Config.bucketName + '.s3-website-us-east-1.amazonaws.com');
    }
    return gulp.src(protractorConfig.config.specs)
        .pipe($.protractor.protractor({
            configFile: configFile,
            args: args
        }))
        .on('error', function(e) {
            console.error(e);
            process.exit(1);
        });
});

gulp.task('test:unit', function (done) {
    var karma = require('karma').server;
    karma.start({
        configFile: __dirname + '/../karma.conf.js',
        singleRun: true
    }, done);
});
