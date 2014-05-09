'use strict';

angular.module('28.ioApp')
.directive('flip', function(){
    
    var flip = false;
    
    return function($scope, elm){
        elm.bind('mouseenter', function(){
            elm.toggleClass('flip');
        });

        elm.bind('mouseleave', function(){
            elm.toggleClass('flip');
        });
    };
})
.controller('HomeCtrl', function() {
    
});