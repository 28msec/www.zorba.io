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
        } else if ($scope.index.url && $scope.index.url.substring(0, 'zorba'.length) === 'zorba') {
            $scope.type = 'zorba';
        }

        console.log($scope.index);

        $scope.getDoxygenURL = function () {
            return 'https://github.com/28msec/zorba/blob/master/doc/zorba/' + $scope.index.id + '.dox';
        };
    });
