'use strict';

angular
    .module('zorba.28.io')
    .config(function ($stateProvider) {
        $stateProvider
            .state('404', {
                url: '{path:.*}',
                templateUrl:'/not-found/not-found.html',
                controller: 'NotFoundCtrl'
            });
    });
