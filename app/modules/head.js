'use strict';

angular.module('og', ['lodash'])
    .directive('head', function($rootScope, $location, _){
        return {
            restrict: 'E',
            link: function($scope, $element){

                var original = {
                    title: 'NoSQL Query Processor',
                    description: 'NoSQL Query Processor',
                    image: '/images/favicon.png'
                };

                var titleE = $element.find('title');
                var url = angular.element($element[0].querySelector('meta[property=\'og:url\']'));
                var siteName = angular.element($element[0].querySelector('meta[property=\'og:site_name\']'));
                var title = angular.element($element[0].querySelector('meta[property=\'og:title\']'));
                var twitterTitle =  angular.element($element[0].querySelector('meta[property=\'twitter:title\']'));
                var description = angular.element($element[0].querySelector('meta[property=\'og:description\']'));
                var twitterDescription =  angular.element($element[0].querySelector('meta[property=\'twitter:description\']'));
                var image = angular.element($element[0].querySelector('meta[property=\'og:image\']'));
                var twitterImage =  angular.element($element[0].querySelector('meta[property=\'twitter:image:src\']'));

                url.attr('content', 'https://zorba.28.io' + $location.path());

                $rootScope.$on('$stateChangeSuccess', function(event, toState) {
                    var og = angular.copy(original);
                    _.forEach(toState.data, function(val, key){
                        og[key] = val;
                    });
                    siteName.attr('content', 'Zorba - ' + og.title);
                    titleE.text('Zorba - ' + og.title);
                    title.attr('content', og.title);
                    twitterTitle.attr('content', og.title);
                    description.attr('content', og.description);
                    twitterDescription.attr('content', og.description);
                    image.attr('content', 'http://zorba.28.io' + og.image);
                    twitterImage.attr('content',  'http://zorba.28.io' + og.image);
                });

                $rootScope.$on('$og', function(event, data){
                    var og = angular.copy(original);
                    _.forEach(data, function(val, key){
                        og[key] = val;
                    });
                    siteName.attr('content', 'Zorba - ' + og.title);
                    titleE.text('Zorba - ' + og.title);
                    title.attr('content', og.title);
                    twitterTitle.attr('content', og.title);
                    description.attr('content', og.description);
                    twitterDescription.attr('content', og.description);
                    image.attr('content', 'http://zorba.28.io' + og.image);
                    twitterImage.attr('content', 'http://zorba.28.io' + og.image);
                });
            }
        };
    })
;
