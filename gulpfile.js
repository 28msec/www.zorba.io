'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

var Config = require('./tasks/config');

require('./tasks/lint');
require('./tasks/html');
require('./tasks/images');
require('./tasks/s3');
require('./tasks/tests');
require('./tasks/ci');
require('./tasks/prerender');

gulp.task('watch', function() {
    return gulp.watch(Config.paths.sass, ['sass']);
});

gulp.task('fonts', function(){
    return gulp.src('bower_components/font-awesome/fonts/*', { dot: true }).pipe(gulp.dest(Config.paths.dist + '/fonts'));
});

gulp.task('copy-svg', function(){
    return gulp.src(Config.paths.svgs, { dot: true }).pipe(gulp.dest(Config.paths.dist + '/images'));
});

gulp.task('copy-book', function(){
    return gulp.src('app/dl/JSONiq_The_SQL_of_NoSQL-published.pdf').pipe(gulp.dest(Config.paths.dist + '/dl'));
});

gulp.task('copy-atom-feed', function(){
    return gulp.src('app/data/blog/feed.xml', { dot: true }).pipe(gulp.dest(Config.paths.dist + '/data/blog'));
});

gulp.task('extras', function () {
    var extras = Config.paths.html
		.concat(Config.paths.fonts)
		.concat(Config.paths.data)
		.concat([Config.paths.sitemap, Config.paths.robots]);
    return gulp.src(extras, { dot: true })
        .pipe(gulp.dest(Config.paths.dist));
});

gulp.task('clean', function () {
    return gulp.src([Config.paths.tmp, Config.paths.dist], { read: false }).pipe($.clean());
});

gulp.task('build', ['clean'], function(done){
    $.runSequence(['load-config', 'lint', 'html', 'images', 'fonts', 'copy-svg', 'copy-book', 'extras', 'copy-atom-feed'], done);
});

gulp.task('server', ['sass', 'load-config'], function(done){
    $.runSequence('server:dev', done);
});

gulp.task('server:prod', ['build'], function(done){
    $.runSequence('server:dist', done);
});

gulp.task('test', ['server:prod'], function (done) {
    $.runSequence('test:e2e', done);
});

gulp.task('default', ['build']);

gulp.task('seo', function(done){
    if(true || Config.isOnProduction) {
        $.runSequence('prerender', 's3:upload', done);
    } else {
        $.util.log('Only perform SEO task on production.');
        done();
    }
});

gulp.task('setup', function(done){
    $.runSequence('build', 's3-setup', 'server:dist', 'test:e2e', 'seo', 'server:stop', done);
});

gulp.task('teardown', ['load-config'], function(done){
    $.runSequence('s3-teardown', done);
});
