'use strict';

angular.module('zorba.28.io')
    .controller('DocumentationCtrl', function($scope, $stateParams, data){
        $scope.asset = data.asset;

        var index = data.index;
        var current = '/documentation/' + $stateParams.version;
        $scope.stack = [{
            href: current,
            label: 'Documentation v' + index[0].version
        }];

        index.slice(1).forEach(function(element){
            current += '/' + element.id;
            $scope.stack.push({
                href:   current,
                label: element.label
            });
        });

        $scope.type = 'index';
        $scope.version = index[0];
        $scope.index = index[index.length - 1];
        if($scope.index.ns) {
            $scope.type = 'module';
        } else if ($scope.index.id === 'data-sources') {
            $scope.type = 'datasources';
        } else if($scope.index.url) {
            $scope.type = 'api';
        }
    });
