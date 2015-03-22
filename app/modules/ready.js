'use strict';

angular.module('ready', [])
    .directive('ready', function($rootScope){
    return {
        restrict: 'A',
        link: function($scope, $element){
            $element.attr('ready', false);
            $rootScope.$on('$stateChangeSuccess', function() {
                $element.attr('ready', true);
            });
        }
    };
});
