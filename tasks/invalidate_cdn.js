(function() {

'use strict';

module.exports = function(grunt) {

    grunt.registerMultiTask('invalidate_cdn', 'invalidate cdn cache', function(){

        var uuid = require('node-uuid');
        var AWS = require('aws-sdk');
        var libxmljs = require("libxmljs");

        var options = this.options();

        var invalidationBatch = {
            Paths: {
                Items: []
            },
            CallerReference: uuid.v4()
        };

        var config = new AWS.Config({
            "accessKeyId": options.key,
            "secretAccessKey": options.secret,
            "region": "us-east-1"
        });
        var cloudfront = new AWS.CloudFront({apiVersion: '2013-05-12'});

        var xml = grunt.file.read(options.sitemap);
        var xmlDoc = libxmljs.parseXml(xml);

        var children = xmlDoc.root().childNodes();
        children.forEach(function(child){
          var url = child.text().replace(/^\s+|\s+$/g, '').substring("http://www.28.io".length); 
          if(url !== '') {
            invalidationBatch.Paths.Items.push(url);
            invalidationBatch.Paths.Items.push(url + '/');
          }
        });
        invalidationBatch.Paths.Items.push('/');
        
        options.directories.forEach(function(directory){
            directory = grunt.config.process(directory);
            grunt.file.recurse(directory, function(abspath, rootdir, subdir, filename){
                invalidationBatch.Paths.Items.push(abspath.substring(options.cwd.length - 1));
            });
        });
        
        invalidationBatch.Paths.Quantity = invalidationBatch.Paths.Items.length;
        grunt.log.writeln(JSON.stringify(invalidationBatch, null, 2));

        cloudfront.createInvalidation({
              DistributionId: options.distributionId,
              InvalidationBatch: invalidationBatch
        }, function(err, data) {
            grunt.log.writeln('error: ' + err);
            grunt.log.writeln('data: ' + data);
            if(err) throw err;
        });
        
    });
};

}());
