'use strict';

angular.module('navbar-toggle', []).directive('navbarToggle', function(){
    return function($scope, elm) {

        var target = '.navbar-collapse';

        angular.element(document.querySelector('button.navbar-toggle')).bind('click', function(){
                document.querySelector(target).classList.toggle('collapse');
        });

        angular.element(document.querySelectorAll('.navbar-collapse a')).bind('click', function(){
            document.querySelector(target).classList.toggle('collapse');
        });
    };
});