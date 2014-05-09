'use strict';

angular.module('28.io.ace', [])
.factory('HTML', function(){
    return {
        encode: function(value){
            return angular.element('<div/>').text(value).html();
        },

        decode: function(value){
            return angular.element('<div/>').html(value).text();
        }
    };
})
.directive('bindHtml2', function(HTML){
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            content: '@bindHtml2'
        },
        link: function($scope, elm, attrs) {
            elm.html($scope.content);
            angular.forEach(elm[0].querySelectorAll('pre[highlight-as]'), function(e, i){
                e = angular.element(e);
                var modeID = e.attr('highlight-as');
                var Mode = require('ace/mode/' + modeID).Mode;
                var mode = new Mode();
                var tokenizer = mode.$tokenizer;
                var source = e.text().split('\n');
                var state = 'start';
                var html = '';
                
                
            source.forEach(function(line, index){
                setTimeout(function(){
                    var tokens = tokenizer.getLineTokens(line, state);
                    state = tokens.state;
                    tokens = tokens.tokens;
                    tokens.forEach(function(token){
                        html += '<span class="ace_' + token.type.split('.').join(' ace_') + '">' + HTML.encode(token.value)  + '</span>';
                    });
                    html += '<br>';
                    if(index === (source.length - 1)) {
                        e.html(html);
                    }
                }, 50);
            });
            });
            console.log($scope.content);
        }
    };
})
.directive('highlightAs', function(HTML, $compile){
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            source: '@source'
        },
        link: function($scope, elm, attrs){
            var modeID = elm.attr('highlight-as');
            var Mode = require('ace/mode/' + modeID).Mode;
            var mode = new Mode();
            var tokenizer = mode.$tokenizer;
            var source = $scope.source.split('\n');
            var state = 'start';
            var html = '';
        
            source.forEach(function(line, index){
                setTimeout(function(){
                    var tokens = tokenizer.getLineTokens(line, state);
                    state = tokens.state;
                    tokens = tokens.tokens;
                    tokens.forEach(function(token){
                        html += '<span class="ace_' + token.type.split('.').join(' ace_') + '">' + HTML.encode(token.value)  + '</span>';
                    });
                    html += '<br>';
                    if(index === (source.length - 1)) {
                        elm.html(html);
                    }
                }, 50);
            });
        }
    };
})
;