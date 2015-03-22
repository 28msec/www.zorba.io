'use strict';

angular.module('zorba.28.io', [
    'ngSanitize',
    'ui.bootstrap',
    'ui.router',
    'duScroll',
    'ngProgressLite',
    'angulartics',
    'angulartics.google.analytics',
    'documentation-api',
    'user-agent',
    'ready',
    'footer',
    'og'
])
.run(function($document, $location, $rootScope, ngProgressLite) {

    $rootScope.$on('$stateChangeStart', function() {
        $rootScope.navCollapsed = true;
        ngProgressLite.start();
    });

    $rootScope.$on('$stateChangeSuccess', function() {
        ngProgressLite.done();
    });

    $rootScope.$on('$stateChangeError', function() {
        ngProgressLite.done();
    });

    $rootScope.scrollToTop = function(){
        $document.scrollToElementAnimated(window.document.querySelector('body'), 50, 300);
    };

    $rootScope.$watch(function(){
        return document.getElementById($location.hash());
    }, function(newVal, oldVal){
        if(newVal !== oldVal && newVal !== null) {
            $document.scrollToElementAnimated(newVal, 50 + 15, 300);
        }
    });
})
.config(function ($provide, $urlRouterProvider, $stateProvider, $locationProvider) {

    // Deal with trailing slash
    $urlRouterProvider.rule(function($injector, $location) {
        var path = $location.path(), search = $location.search(), hash = $location.hash();
        if (path[path.length-1] !== '/') {
            path += '/';
            if (Object.keys(search).length > 0) {
                var params = [];
                angular.forEach(search, function(v, k){
                    params.push(k + '=' + v);
                });
                path += '?' + params.join('&');
            }
            if(hash && hash.length > 0) {
                path += '#' + hash;
            }
            return path;
        }
    });

    $locationProvider.html5Mode(true);
    $stateProvider.state('400', {
        templateUrl: '/400/400.html'
    });
})
;
