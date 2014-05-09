'use strict';

angular.module('previous', []).directive('previous', function(){
    
    return function($scope, elm) {
        Array.prototype.forEach.call(elm, function(e){
            setTimeout(function(){
                e.classList.add('slideLeft');
            }, 10);
        });
    };
}).directive('next', function(){
    return function($scope, elm) {
        Array.prototype.forEach.call(elm, function(e){
            setTimeout(function(){
                e.classList.add('slideRight');
            }, 10);
        });
    };
});