'use strict';

angular.module('footer', [])
.directive('stickyFooter', function(){
    return {
        restrict: 'A',
        link: function($scope, $element){
            var resize = function(){
                var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                var footer = document.querySelector('body > footer');
                    $element.css('min-height', (height - 30 - footer.getBoundingClientRect().height) + 'px');
            };
            angular.element(window).bind('resize', resize);
            resize();
        }
    };
})
.directive('currentYear', function(){
    return {
        restrict: 'A',
        link: function($scope, $element){
            var date = new Date();
            $element.text(date.getFullYear());
        }
    };
})
;
