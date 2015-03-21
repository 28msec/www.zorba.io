'use strict';

angular
.module('zorba.28.io')
.config(function ($stateProvider) {
    $stateProvider
        .state('home', {
            url: '/',
            isAbstract: true,
            templateUrl: '/home/home.html',
            controller: 'HomeCtrl'
        });
});
