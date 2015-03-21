'use strict';

angular.module('zorba.28.io')
    .controller('DocumentationIndexCtrl', function($scope){
        $scope.children = $scope.index.children;
        $scope.getPath = function(child){
            return $scope.stack[$scope.stack.length - 1].href + '/' + child.id;
        };
    });
