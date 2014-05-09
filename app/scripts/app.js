'use strict';

angular.module('28.ioApp', ['ngSanitize', 'ngRoute', 'ui.bootstrap', 'entry', 'sidePanel', 'previous', 'disqus', 'navbar-toggle', '28.io.ace'])
.run(function($rootScope, $location){
    var scrollTo = function() {
        var anchor = $location.search().anchor;
        var el = document.getElementById(anchor);
        if(el) {
            el.scrollIntoView(true);
        } else {
          var el = document.querySelector("*[name='" + anchor + "']");
          if(el) {
            el.scrollIntoView(true);
          }
        }
    };
  
    $rootScope.$watch(function(){
        var anchor = $location.search().anchor;
        return anchor;
    }, scrollTo);
    
    $rootScope.$on('$anchorScroll', function(){
        setTimeout(function(){ scrollTo(); }, 10);
    });
})
.config(function ($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(true);

    $routeProvider
        .when('/', {
            redirectTo: '/home'
        })
        .when('/home', {
            templateUrl: '/views/home.html',
            controller: 'HomeCtrl'
        })
        .when('/debug', {
            templateUrl: '/views/debug.html'
        })
        .when('/terms-of-use', {
            templateUrl: '/views/terms-of-use.html'
        })

        .when('/outdated', {
            templateUrl: '/views/outdated.html'
        })

        .when('/blog/', {
            templateUrl: '/views/blog.html',
            controller: 'BlogCtrl'
        })
        .when('/blog/tags/:tag', {
            templateUrl: '/views/blog.html',
            controller: 'BlogCtrl'
        })
        .when('/blog/:id/:slug', {
            templateUrl: '/views/blog.html',
            controller: 'BlogCtrl',
            reloadOnSearch: false
        })
    
        ////////////////////
        //// Documentation
        ////////////////////
        .when('/documentation', {
            redirectTo: '/documentation/latest'
        })
        .when('/documentation/:version', {
            templateUrl: '/views/documentation.html',
            controller: 'DocsCtrl',
            reloadOnSearch: false
        })
        .when('/documentation/:version/:uri*', {
            templateUrl: '/views/documentation.html',
            controller: 'DocsCtrl',
            reloadOnSearch: false
        })
    
        ////////////////////
        //// Download
        ////////////////////
        .when('/download', {
            templateUrl: '/views/download.html'
        })
    
        ////////////////////
        //// Download
        ////////////////////
        .when('/modules/:version/:ns*', {
            controller: 'DocModulesCtrl',
            templateUrl: '/views/redirect.html'
        })
        .when('/pages/:version/:api/:id', {
            controller: 'DocPagesCtrl',
            templateUrl: '/views/redirect.html'
        })
    
    
        ////////////////////
        //// Tutorials
        ////////////////////
        //.when('/scripting-tutorial', {
            //templateUrl: '/views/scripting-tutorial.html',
            //reloadOnSearch: false
        //})
        .when('/scripting-spec', {
            templateUrl: '/scripting-spec.html',
            reloadOnSearch: false
        })
    
        ////////////////////
        //// 404
        ///////////////////
        .otherwise({ templateUrl:'/views/404.html' });
});
