'use strict';

angular
    .module('zorba.28.io')
    .controller('HomeCtrl', function($scope, $document){

        $scope.goTo = function (eID){
            $document.scrollToElementAnimated(window.document.getElementById(eID), 50, 300);
        };
    })
;
