'use strict';

angular.module('zorba.28.io')
    .controller('NotFoundCtrl', function($scope, $location){
        $scope.path = $location.path();
    });
