'use strict';

var fs = require('fs');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var _ = require('lodash');
var marked = require('kramed');
var renderer = new marked.Renderer();

var xqlintLib = require('xqlint');
var JSONiqLexer = xqlintLib.JSONiqLexer;
var XQueryLexer = xqlintLib.XQueryLexer;

var highlighter = function (code, lang) {
    var result = [];
    var lexer = lang === 'jsoniq' ? new JSONiqLexer() : new XQueryLexer();
    var lines = code.split('\n');
    var title = lines[0].substring(lines[0].indexOf('(:') + '(:'.length).trim();
    title = title.substring(0, title.indexOf(':)'));
    lines.splice(0, 1);
    var state = JSON.stringify(['start']);
    lines.forEach(function(line){
        var tokens = lexer.getLineTokens(line, state);
        state = tokens.state;
        result.push(tokens.tokens);
    });
    var rows = _.chain(result).map(function(tokens, index){
        return _.template('<tr><td data-line-number="<%= line %>"></td><td><%= code %></td></tr>')({
            line: index + 1,
            code: _.chain(tokens).map(function(token){
                return _.template('<span class="token <%= type %>"><%= value %></span>')(token);
            }).join('')
        });
    }).join('\n');
    return {
        title: title,
        lines: rows
    };
};

renderer.code = function(code, language){
    var data = highlighter(code, language);
    var table = _.template('<table class="code-snippet <%= language %>"><tbody><%= lines %></tbody></table>')({
        language: language,
        lines: data.lines
    });
    return _.template('<div class="figure"><div class="meta"><%= title %></div><div><%= table %></div></div>')({ title: data.title, table: table });
};


renderer.footnote = function(refname, text) {
    return '<p class="footnote" id="fn_' + refname + '">\n' +
        '' + refname + '. ' +
        text +
        '&nbsp;<a href="#reffn_' + refname + '" title="Jump back to footnote [' + refname + '] in the text." class="fa fa-arrow-up"></a>\n' +
        '</p>\n';
};

renderer.image = function(href, title, text) {
    return _.template('<figure><figcaption class="hidden-sm hidden-xs"><%= text %></figcaption><img src="<%= href %>" alt="<%= text %>" title="<%= title %>"><small class="visible-sm visible-xs"><em><%= text %></em></small></figure>')({
        href: href,
        title: title,
        text: text
    });
};

marked.setOptions({
    renderer: renderer,
    gfm: true
});

var Config = require('./config');

var file = Config.paths.credentials;
var tplParam = { file: file };

var msgs = {
  notFound: _.template('<%= file %> is not found.')(tplParam),
  alreadyExists: _.template('<%= file %> exists already, do nothing.')(tplParam)
};

var cmds = {
  encrypt: _.template('sh -c "openssl aes-256-cbc -k $TRAVIS_SECRET_KEY -in <%= file %> -out <%= file %>.enc"')(tplParam),
  decrypt: _.template('sh -c "openssl aes-256-cbc -k $TRAVIS_SECRET_KEY -in <%= file %>.enc -out <%= file %> -d"')(tplParam)
};

gulp.task('env-check', function(done){
  if(process.env.TRAVIS_SECRET_KEY === undefined) {
      done('environment variable TRAVIS_SECRET_KEY is not set.');
  } else {
      done();
  }
});

gulp.task('encrypt', ['env-check'], function(done){
  if(fs.existsSync(file)) {
    $.runSequence('encrypt-force', done);
  } else {
    console.error(msgs.notFound);
    process.exit(1);
  }
});

gulp.task('decrypt', ['env-check'], function(done){
  if(!fs.existsSync(file)) {
    $.runSequence('decrypt-force', done);
  } else {
    $.util.log(msgs.alreadyExists);
      done();
  }
});

gulp.task('encrypt-force', ['env-check'], $.shell.task(cmds.encrypt));
gulp.task('decrypt-force', ['env-check'], $.shell.task(cmds.decrypt));

gulp.task('load-config', ['decrypt'], function(){

    //var Mustache = require('mustache');
    Config.credentials = JSON.parse(fs.readFileSync(Config.paths.credentials, 'utf-8'));
/*
    //Fetch documentation
    var urls = [];
    var addUrl = function(item, version, isLatest, current){
        urls.push('/documentation/' + version + current + item.id);
        if(isLatest) {
            urls.push('/documentation/latest' + current + item.id);
        }
        if(item.children) {
            item.children.forEach(function(child){
                addUrl(child, version, isLatest, current + item.id + '/');
            });
        }
    };
    var docIndex = JSON.parse(fs.readFileSync('app/data/documentation/index.json', 'utf-8'));
    docIndex.versions.forEach(function(version){
        var isLatest = version.latest === true;
        urls.push('/documentation/' + version.version);
        urls.push('/documentation/latest');
        version.children.forEach(function(child){
            addUrl(child, version.version, isLatest, '/');
        });
    });

    //Prepare blog
    var authors = [{
            id: '28msec',
            name: 'the 28msec Team',
            email: 'hello@28.io',
            uri: 'https://twitter.com/28msec'
        }, {
            id: 'wcandillon',
            name: 'William Candillon',
            email: 'w@28.io',
            uri: 'https://twitter.com/wcandillon'
        }, {
            id: 'gfourny',
            name: 'Ghislain Fourny',
            email: 'g@28.io',
            uri: 'mailto:g@28.io'
    }];
    var feed = {
        entries: []
    };
    var base = 'app/data/blog';
    var files = fs.readdirSync(base);
    files.forEach(function(file){
        if(file.substring(file.lastIndexOf('.') + 1) === 'md') {
            var md = fs.readFileSync(base + '/' + file, 'utf-8');
            var segments = [];
            var tokens = md.split('<!--');
            tokens.forEach(function(token){
                var subSegments = token.split('-->');
                subSegments.forEach(function(subSegment){
                    subSegment = subSegment.trim();
                    if(subSegment !== '') {
                        segments.push(subSegment);
                    }
                });
            });
            var entry = JSON.parse(segments[0]);
            entry.summary = marked(segments[1]);
            entry.content = entry.summary + marked(segments[3]);
            entry.id = file.substring(0, file.lastIndexOf('.'));
            urls.push('/blog/' + entry.id);
            authors.forEach(function(author){
                if(author.id === entry.author) {
                    entry.author = author;
                }
            });
            feed.entries.push(entry);
        }
    });
    feed.entries = _.sortByOrder(feed.entries, ['updated'], [false]);
    fs.writeFileSync('app/data/blog/feed.json', JSON.stringify(feed), 'utf-8');

    var templates = [
        {
            src: 'tasks/templates/sitemap.xml.mustache',
            data: {
                urls: urls
            },
            dest: 'app/sitemap.xml'
        },
        {
            src: 'tasks/templates/feed.xml.mustache',
            data: feed,
            templates: {
                entry: fs.readFileSync('tasks/templates/entry.xml.mustache', 'utf-8')
            },
            dest: 'app/data/blog/feed.xml'
        }
    ];

    templates.forEach(function(tpl){
        var src = fs.readFileSync(tpl.src, 'utf-8');
        var result = Mustache.render(src, tpl.data, tpl.templates);
        $.util.log($.util.colors.gray(tpl.dest));
        fs.writeFileSync(tpl.dest, result, 'utf-8');
    });
    */
});

