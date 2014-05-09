(function() {

'use strict';

module.exports = function(grunt) {
   
    var getFilePath = function(dest, base, url) {
      var path = url.replace(base, '');
      var fileName =  dest + path;
      if(fileName[fileName.length - 1] !== '/') {
        fileName += '/';
      }
      fileName += 'index.html';
      return fileName;
    };
    
    var mkdirp = require('mkdirp');
    var fs          = require("fs"),
        path        = require("path");
    var libxmljs = require("libxmljs");
    var http = require('http');
    var uuid = require('node-uuid');
    var uri = require('url');
    var webpage = require('node-phantom-simple');
    var async = require('async');

    var asset = path.join.bind(null, __dirname);
        
    var crawl = function(ph, url, callback, options) {
      var pathname = url;
      url = uri.resolve(options.sitePath, url);
      url = uri.parse(url);
      delete url.hash;
      url  = uri.format(url);
      ph.createPage(function(err, page){
        grunt.log.writeln("open: " + url);
        page.open(url, function(status){
          if(status === 'fail') {
            console.log("Couldn't crawl " + url);
          } else {
            console.log("Crawling " + url);
            //visitedURLs[url] = true;
            var run = function(){
              
              page.evaluate(function () {
                document.querySelector("body").setAttribute("ng-cloak");
                return document.childNodes.item(1).outerHTML;
              }, function(err, documentHTML){
                var dest = options.dest + pathname + '/index.html';
                var redirect = "<script type=\"text/javascript\">location.href = '/#' + location.pathname;</script>";
                fs.writeFileSync(dest, "<!DOCTYPE html>" + documentHTML + redirect);
                grunt.log.writeln("write in: " + dest);
                //p = uri.parse(url).path;
                page.close();
                callback(null, null);
             
              });
            };
            
            var checkStatus = function(){
              page.evaluate(function(){
                return document.querySelectorAll("body").item(0).getAttribute("data-ready") == "true";
              }, function(ready){
                if(true) {
                  run();
                } else {
                  grunt.log.writeln("waiting...");
                  setTimeout(checkStatus, 100);
                }
              });
            };
            setTimeout(checkStatus, 5000);
          }
        });
      });
    };

    grunt.registerMultiTask('snapshots2', 'fetch html snapshots', function(){

        var options = this.options();
        var tpl = fs.readFileSync(options.index, "UTF-8");
        
        var xml = grunt.file.read(options.sitemap);
        var xmlDoc = libxmljs.parseXml(xml);

        var children = xmlDoc.root().childNodes();
        var urls = [];
        children.forEach(function(child){
          var url = child.text().replace(/^\s+|\s+$/g, '').substring("http://www.zorba.io".length); 
          if(url !== '') {
            urls.push(url);
          }
        });
 
        urls.forEach(function(url){
            grunt.log.writeln("url: " + url);
            var fileName = getFilePath(options.dest, options.sitePath, url);
            var dirname = path.dirname(fileName);
            mkdirp.sync(dirname);
            fs.writeFileSync(fileName, tpl, "UTF-8", { flags: 'w+' });
            grunt.log.writeln("Set index.html at " + fileName); 
        });
        
        var done = this.async();
        var series = [];
        webpage.create(function(err, ph){
          grunt.log.writeln("created()");
          urls.forEach(function(url){
            series.push(function(callback){
              crawl(ph, url, callback, options);
            });
          });
          grunt.log.writeln("series: " + series.length);
          async.series(series, function(err, r){
            grunt.log.writeln("series result: " + r);
            grunt.log.writeln("series error: " + err);
            ph.exit();
            done();
          });
        });
    });
 };
}());
