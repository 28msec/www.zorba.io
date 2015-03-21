'use strict';

angular.module('user-agent', [])
    .directive('userAgent', function(){
        return {
            restrict: 'A',
            link: function($scope, $element){
                $element.attr('user-agent', navigator.userAgent);
            }
        };
    });
