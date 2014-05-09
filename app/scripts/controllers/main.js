'use strict';

angular.module('28.ioApp').controller('MainCtrl', function ($scope, $route, $routeParams, $location, $window) {

    $scope.ready = false;

    $scope.ptrs = [];
    $scope.it = [];

    $scope.menu = {
        home: { href: '/home', label: 'Home' },
        documentation: { href: '/documentation', label: 'Documentation' },
        tryzorba: { href: 'http://try.zorba.io/', label: 'Live Demo' },
        blog: { href: '/blog', label: 'Blog' },
        download: { href: '/download', label: 'Download' }
    };

    $scope.navClass = function(href) {
        var currentRoute = $location.path() || '/';
        if(href === '/') {
            return currentRoute === href ? 'active' : '';
        } else {
            return currentRoute.indexOf(href) === 0 ? 'active' : '';
        }
    };
    
    
    $scope.$on('$viewContentLoaded', function() {
        if(typeof $window._gaq !== 'undefined') {
            $window._gaq.push(['_trackPageView', $location.path()]);
        }
        if(typeof mktoMunchkinFunction !== 'undefined') {
            mktoMunchkinFunction('visitWebPage', { url: $location.path() });
        }
        $scope.ready = true;
        $scope.path = $location.path();
    });
    
    $scope.computeCurrentAnimation = function() {
        //if($location.path().substring(0, 8) === '/company' || $location.path().substring(0, 14) === '/documentation') {
            return {};
        //} else {
        //    return { enter: 'section-enter' };
        //}
    };
    /*
    $scope.$on('$routeChangeSuccess', function(){
        $scope.$emit('')
    });
    */
    //});

    //$scope.$on('ready', function(){
    //    $scope.ready = true;
    //});
});
