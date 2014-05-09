'use strict';

angular.module('entry', []).directive('entry', function(){
    
    var loadContent = function($scope, elm) {
        if($scope.entries.length !== 1) {
            return;
        }
        var Sha1 = Sha1 || {};
        Array.prototype.forEach.call(elm, function(e, k){
            if($scope.entries.length === 0) {
                return;
            }
            var content = $scope.entries[k].content;
            e.innerHTML = content;
            Array.prototype.forEach.call(e.getElementsByClassName('wistia_embed'), function(embedE){
                var id = embedE.getAttribute('id').substring(7);
                var s = document.createElement('script');
                s.charset = 'ISO-8859-1';
                s.async = 'true';
                s.type = 'text/javascript';
                s.src = 'http://fast.wistia.com/embed/medias/' + id + '/metadata.js';
                document.getElementsByTagName('body')[0].appendChild(s);
                var embed = window.Wistia.embed(id);
                if($scope.wemail !== undefined) {
                    embed.bind('play', function(){
                        mktoMunchkinFunction ('visitWebPage',{ url: document.location.path, params: 'playedVideo=25' }, Sha1.hash('81f35d90c6b011e28b8b0800200c9a66' + $scope.wemail));
                    });
                    
                    embed.bind('timechange', function(second){
                        var total = embed.duration();
                        if(Math.floor(second) === Math.floor(total/2)) {
                            mktoMunchkinFunction ('visitWebPage',{ url: document.location.path, params: 'playedVideo=50' }, Sha1.hash('81f35d90c6b011e28b8b0800200c9a66' + $scope.wemail));
                        }
                    });
                    
                    embed.bind('end', function(){
                        mktoMunchkinFunction ('visitWebPage',{ url: document.location.path, params: 'playedVideo=100' }, Sha1.hash('81f35d90c6b011e28b8b0800200c9a66' + $scope.wemail));
                    });
                }
            });
        });
        
    };
    
    return function($scope, elm){
        $scope.$watch('entries', function(){
            loadContent($scope, elm);
        });
    };
});