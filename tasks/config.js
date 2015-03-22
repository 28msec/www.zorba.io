'use script';

var minimist = require('minimist');

var knownOptions = {
    string: 'build-id',
    default: { 'build-id': process.env.RANDOM_ID }
};
var buildId = minimist(process.argv.slice(2), knownOptions)['build-id'];
var isOnTravis = process.env.CIRCLE_BUILD_NUM !== undefined;
var isOnTravisAndMaster = isOnTravis && process.env.CIRCLE_BRANCH === 'master' && process.env.CI_PULL_REQUEST === 'false';

var bucketName = isOnTravisAndMaster ? 'zorba.28.io' : 'zorba.28.io-' + buildId;
var projectName = isOnTravisAndMaster ? 'zorba.28.io' : 'zorba.28.io-' + buildId;

module.exports = {
    isOnTravis: isOnTravis,
    isOnProduction: isOnTravisAndMaster,
    bucketName: bucketName,
    projectName: projectName,
    paths: {
        //src and build folders
        app: 'app',
        dist: 'dist',
        tmp: '.tmp',
        queries: 'queries',

        //Reports
        reports: 'data/*.json',

        //Static Assets
        json: ['*.json'],
        js: ['app/**/*.js'],
        css: ['app/**/*.css'],
        index: 'app/*.html',
        html: ['app/**/*.html'],
        images: 'app/images/**/*.{gif,jpg,png}',
        svgs: 'app/images/**/*.svg',
        sass: ['app/**/*.scss'],
        fonts: ['app/**/*.ttf', 'app/**/*.woff'],

        data: ['app/**/*.json'],

        //CI
        tasks: ['gulpfile.js', 'tasks/*.js'],

        //Crypted config
        credentials: 'config.json',

        //Queries
        jsoniq: ['queries/**/*.{xq,jq}'],

        entries: 'app/data/blog/*.md',

        sitemap: 'app/sitemap.xml',
        robots: 'app/robots.txt'
    },
    credentials: {}
};
