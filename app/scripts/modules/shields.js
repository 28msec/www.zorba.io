'use strict';

angular.module('shieldAnim', []).directive('shieldAnim', function(){
    return function($scope, elm) {
        elm[0].addEventListener('click', function(){
            var front = document.getElementsByClassName('front')[0];
            var middleLeft = document.getElementsByClassName('middle-left')[0];
            var middleRight = document.getElementsByClassName('middle-right')[0];
            var back = document.getElementsByClassName('back')[0];
    
            front.classList.remove('front');
            front.classList.add('middle-left');
    
            middleLeft.classList.remove('middle-left');
            middleLeft.classList.add('back');
    
            back.classList.remove('back');
            back.classList.add('middle-right');
    
            middleRight.classList.remove('middle-right');
            middleRight.classList.add('front');
        });
    };
});