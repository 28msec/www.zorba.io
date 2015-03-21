'use strict';

angular
    .module('zorba.28.io')
    .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.when('/documentation', '/documentation/latest/');
        $urlRouterProvider.when('/documentation/latest', '/documentation/latest/');
        $stateProvider
            .state('documentation', {
                url: '/documentation/:version/*path',
                templateUrl: '/documentation/documentation.html',
                controller: 'DocumentationCtrl',
                resolve: {
                    data: ['$stateParams', 'DocumentationAPI', function($stateParams, DocumentationAPI){
                        return DocumentationAPI.getVersion($stateParams.version).then(function(version){
                            var segments = $stateParams.path === '' ? [] : $stateParams.path.split('/').filter(function(element, index){
                                if(element === '' && index > 0) {
                                    return false;
                                } else {
                                    return true;
                                }
                            });
                            var index = DocumentationAPI.getIndex(version, segments);
                            var url = index[index.length - 1].url;
                            if(url) {
                                return DocumentationAPI.getAsset(version, url).then(function(asset){
                                    return {
                                        index: index,
                                        asset: asset
                                    };
                                });
                            } else {
                                return {
                                    index: index
                                };
                            }
                        });
                    }]
                }
            })
        ;
    });
