'use strict';

angular.module('28.ioApp')
.controller('DocModulesCtrl', function($scope, $routeParams, $location, $http) {
    
    $scope.state = 'loading';
    var version = $routeParams.version;
    var ns = 'http://' + $routeParams.ns;
    
    var findItemHref = function(item, ns, url) {
        if(item.ns === ns) {
            return url;
        }
        if(item.children) {
            var ret = undefined;
            item.children.forEach(function(child){
                var res = findItemHref(child, ns, url + '/' + child.id);
                if(res !== undefined) {
                    ret = res;
                    return false;
                }
            });
            return ret;
        }
    };
    
    $http({
        url: '/documentation/index.json',
        method: 'GET'
    }).success(function(index){
        var idx = index.versions.forEach(function(v){
            if(v.version === version || (version === 'latest' && v.latest === true)) {
                var href = findItemHref(v, ns, '');
                if(href) {
                    $location.path('/documentation/' + (v.latest ? 'latest' : v.version) + href);
                    $location.replace();
                } else {
                    $scope.state = 'notfound';   
                }
            }
        });
    });
    
})
.controller('DocPagesCtrl', function($scope, $routeParams, $http, $location){
    
    var version = $routeParams.version;
    var api = $routeParams.api;
    var id = $routeParams.id;

    if(api !== 'zorba') {
        $location.path('http://docs.zorba.io.s3-website-us-east-1.amazonaws.com/' + version + '/' + api + '/' + id + 'html');
        $location.replace();
        return;
    }
    
    
    var findItemHref = function(item, id, url) {
        if(item.id === id && item.url === 'zorba/' + id + '.html') {
            return url;
        }
        if(item.children) {
            var ret = undefined;
            item.children.forEach(function(child){
                var res = findItemHref(child, id, url + '/' + child.id);
                if(res !== undefined) {
                    ret = res;
                    return false;
                }
            });
            return ret;
        }
    };
    
    $http({
        url: '/documentation/index.json',
        method: 'GET'
    }).success(function(index){
        var idx = index.versions.forEach(function(v){
            if(v.version === version || (version === 'latest' && v.latest === true)) {
                var href = findItemHref(v, id, '');
                if(href) {
                    $location.path('/documentation/'  + (v.latest ? 'latest' : v.version) + href);
                    $location.replace();
                } else {
                    $scope.state = 'notfound';   
                }
            }
        });
    });
});