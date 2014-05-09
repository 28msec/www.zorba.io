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

    var asset = path.join.bind(null, __dirname);

    grunt.registerMultiTask('snapshots', 'fetch html snapshots', function(){

        var options = this.options();
        var tpl = fs.readFileSync(options.index, "UTF-8");
        
        var xml = grunt.file.read(options.sitemap);
        var xmlDoc = libxmljs.parseXml(xml);

        var children = xmlDoc.root().childNodes();
        var urls = [];
        children.forEach(function(child){
          var url = child.text().replace(/^\s+|\s+$/g, '').substring("http://www.28.io".length); 
          if(url !== '') {
            urls.push(url);
          }
        });

        // the channel prefix for this async grunt task
        var taskChannelPrefix = "" + new Date().getTime();

        var sanitizeFilename = function(name){
            return name.replace(/#|\/|\!/g,'_') || '';
        };

        var isLastUrl = function(url){
            return urls[urls.length - 1] === url;
        };

        //phantom.on(taskChannelPrefix + ".error.onError", function (msg, trace) {
        //    grunt.log.writeln('error: ' + msg);
        //    phantom.halt();
        //});

        //phantom.on(taskChannelPrefix + ".console", function (msg, trace) {
        //    grunt.log.writeln(msg);
        //});

        //phantom.on(taskChannelPrefix + ".htmlSnapshot.pageReady", function (msg, url) {
        //    var fileName = getFilePath(options.dest, sitePath, url);
        //    grunt.file.write(fileName, msg);
        //    grunt.log.writeln(fileName, 'written');
        //    phantom.halt();
        //    
        //    grunt.log.writeln("fileName: " + fileName);
        //    //grunt.log.writeln("url: " + url);

        //    if(isLastUrl(url.replace(sitePath))) {
        //      done();
        //    }
        //});

        var done = this.async();

        var sitePath = options.sitePath;
        
        urls.forEach(function(url){
            grunt.log.writeln("url: " + url);
            var fileName = getFilePath(options.dest, sitePath, url);
            var dirname = path.dirname(fileName);
            mkdirp.sync(dirname);
            fs.writeFileSync(fileName, tpl, "UTF-8", { flags: 'w+' });
            grunt.log.writeln("Set index.html at " + fileName); 
        });
       
        var series = [];
 
        urls.forEach(function(url, index){
          
          if(index % 20 === 0) {
            series.push({batchRequests:[]});
          } 
          
          series[series.length-1].batchRequests.push({
            "targetUrl": sitePath + url,
            "requestType":"text",
            "outputAsJson":false,
            "loadImages":true,
            "isDebug":false,
            "timeout":15000,
            "postDomLoadedTimeout":5000,
            "userAgent":"PhantomJs.Cloud Rocks",
            "requestId": uuid.v4() 
          });
        });
        
        var done = this.async();
        var callbacks = [];

        var callback = function(response) {
          var str = ''
          response.on('data', function (chunk) {
            str += chunk;
          });
        
          response.on('end', function () {
            grunt.log.writeln(str);
            callbacks.push(JSON.parse(str).callbackUrl);
          });
        };
       
        //grunt.log.writeln("Series: " + series.length);
        //series.forEach(function(serie, index){
        //  grunt.log.writeln("Serie " + index + ": "  + serie.batchRequests.length);
        //}); 
        
        series.forEach(function(batch){
          var options = {
            host: 'api.PhantomJsCloud.com',
            path: '/batch/browser/v1/631e2f47d6bc75a3c9e6fd876dc378da33e1df28/' + encodeURIComponent(JSON.stringify(batch)),
            port: 80,
            method: 'GET'
          };
          var req = http.request(options, callback);
          req.end();
        });
        
        var ptr = null;
        ptr = setInterval(function(){
          grunt.log.writeln("Checking... " + callbacks.length);
          if(callbacks.length === 0) {
            clearInterval(ptr);
            //done();
          }
          callbacks.forEach(function(url){
            var c = uri.parse(url);
            var req = http.request({
              host: c.host,
              path: c.pathname,
              port: 80,
              method: 'GET'
            }, function(res){
              var str = ''
              res.on('data', function (chunk) {
                str += chunk;
              });
            
              res.on('end', function () {
                var body = JSON.parse(str);
                grunt.log.writeln("Still processing: " + body.stillProcessing);
                if(body.stillProcessing === 0) {
                  callbacks.splice(callbacks.indexOf(url), 1);
                  if(callbacks.length === 0) {
                    clearInterval(ptr);
                    done();
                  }
                  grunt.log.writeln("To save: " + body.justCompleted.length);
                  body.justCompleted.forEach(function(page, j){
                    var pageOutput = page.pageOutput;
                    var dest = options.dest + page.pageRequest.targetUrl.replace(sitePath, '') + '/index.html';
                    grunt.log.writeln("Index: " + j);
                    grunt.log.writeln("Destination: " + dest);
                    var redirect = "<script type=\"text/javascript\">location.href = '/#' + location.pathname;</script>";
                    fs.writeFileSync(dest , pageOutput + redirect, "UTF-8", { flags: 'w+' });
                  });
                }
              });
            });
            req.end();
          });
        }, 20000);
        grunt.log.writeln('running html-snapshot task...hold your horses');
    });
};

}());
