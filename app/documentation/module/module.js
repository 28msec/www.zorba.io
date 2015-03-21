'use strict';

angular.module('zorba.28.io')
    .controller('DocumentationModuleCtrl', function($scope, $sce){

        var normalizeNS = function(ns) {
            return ns.replace('http://', '').replace(/\//gi, '_');
        };

        var getJSONURL = function(ns) {
            ns = normalizeNS(ns);
            return '/data/documentation/'  + $scope.version.version + '-' + $scope.version.codename + '/modules/' + ns + '.json';
        };

        var getXMLURL = function(ns) {
            ns = normalizeNS(ns);
            return '/data/documentation/'  + $scope.version.version + '-' + $scope.version.codename + '/modules/xml/' + ns + '.xml';
        };

        $scope.xqdoc = $scope.asset;
        $scope.jsonURL = getJSONURL($scope.xqdoc.ns);
        $scope.xmlURL = getXMLURL($scope.xqdoc.ns);
        $scope.xqdoc.description = $sce.trustAsHtml($scope.xqdoc.description);
        $scope.xqdoc.functions.forEach(function(fn){
            fn.description = $sce.trustAsHtml(fn.description);
            fn.returns.description = $sce.trustAsHtml(fn.returns.description);
            fn.parameters.forEach(function(param){
                param.description = $sce.trustAsHtml(param.description);
            });
        });
        $scope.xqdoc.variables.forEach(function(v){
            v.description = $sce.trustAsHtml(v.description);
        });


    });
