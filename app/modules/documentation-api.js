'use strict';

angular.module('documentation-api', [])
    .factory('DocumentationAPI', function($http){
        var $stateNotFound = '$stateNotFound';
        var $cache = true;

        return {
            getVersion: function(version){
                return $http({
                    method: 'GET',
                    url: '/data/documentation/index.json',
                    cache: $cache
                }).then(function(response){
                    var index;
                    response.data.versions.forEach(function(v){
                        if(v.latest === true || v.version === version) {
                            index = v;
                            return false;
                        }
                    });
                    if(!index) {
                        throw new Error($stateNotFound);
                    }
                    return index;
                });
            },

            getIndex: function(index, segments, stack){
                var that = this;
                if(!stack) {
                    stack = [index];
                }
                if(segments.length === 0) {
                    return stack;
                }
                var result;
                index.children.forEach(function(child){
                    if(child.id === segments[0]) {
                        stack.push(child);
                        result = that.getIndex(child, segments.slice(1), stack);
                    }
                });
                if(result) {
                    return result;
                } else {
                    throw new Error();
                }
            },

            getAsset: function(version, url){
                return $http({
                    method: 'GET',
                    url: '/data/documentation/' + version.version + '-' + version.codename + '/' + url,
                    cache: $cache
                }).then(function(response){
                    return response.data;
                });
            }
        };
    });
