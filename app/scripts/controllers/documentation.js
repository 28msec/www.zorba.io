'use strict';

angular.module('28.ioApp')
.directive('accordion', function($window, $location, $rootScope){
    
    var removeFixedSection = function() {
        var fixed = document.querySelector('.fixed-accordion');
        if(fixed) {
            
            var header = fixed.querySelector('.accordion-header');
            var content = fixed.querySelector('.accordion-content');
            
            fixed.classList.remove('fixed-accordion');
            content.classList.remove('accordion-slide');
            header.style.width = 'inherit';
            content.style.height = (
                    parseInt(content.style.height) - 
                    parseInt(content.style.paddingTop)
            ) + 'px';
            content.style.paddingTop = '0';
            setTimeout(function(){ content.classList.add('accordion-slide'); }, 0);
        }
    };
    
    angular.element($window).bind('resize', function(){
        removeFixedSection();
    });
    
    return function($scope, elm){
        var toggle = false;
        var header = angular.element(elm[0].querySelector('.accordion-header'));
        var content = angular.element(elm[0].querySelector('.accordion-content'));
        var inner = angular.element(elm[0].querySelector('.accordion-content-inner'));
        content.css({ 'height': '0' });
        header.bind('click', function(){
            removeFixedSection();
            $scope.$apply(function(){
                $location.search({ anchor: elm.attr('id') });
                $rootScope.$emit('$anchorScroll');
            });
            //$rootScope.$emit('$anchorScroll');
            toggle = !toggle;
            if(toggle) {
                content.css({
                    'height':  (inner[0].getBoundingClientRect().height + 30) + 'px'
                });
            } else {
                //elm[0].classList.remove('fixed-accordion');
                //elm[0].querySelector('.accordion-content').style.paddingTop = '0';
                content.css({
                    'height': '0'
                });
            }
        });
        
        var scrollHandler = function(){
            //return;
            var rect = elm[0].getBoundingClientRect();
            //if(rect.top === 0) { return ; }
            var header = elm[0].querySelector('.accordion-header');
            var content = elm[0].querySelector('.accordion-content');
            
            if(rect.top < 50
               && content.getBoundingClientRect().bottom > 400
               && !elm[0].classList.contains('fixed-accordion')
              ) {
                
                elm[0].classList.add('fixed-accordion');
                content.classList.remove('accordion-slide');
                header.style.width = rect.width + 'px';
                content.style.paddingTop = (header.getBoundingClientRect().height + 15) + 'px';
                content.style.height = (
                    parseInt(content.style.height) +
                    parseInt(content.style.paddingTop)
                ) + 'px';
                setTimeout(function(){ content.classList.add('accordion-slide'); }, 0);
                
            } else if(
                (rect.top >= 50 || content.getBoundingClientRect().bottom <= 200)
                && elm[0].classList.contains('fixed-accordion')
            ){
                
                elm[0].classList.remove('fixed-accordion');
                content.classList.remove('accordion-slide');
                header.style.width = 'inherit';
                content.style.height = (
                    parseInt(content.style.height) - 
                    parseInt(content.style.paddingTop)
                ) + 'px';
                content.style.paddingTop = '0';
                setTimeout(function(){ content.classList.add('accordion-slide'); }, 0);
                
            }
        };
        angular.element($window).bind('scroll', scrollHandler);
        //setTimeout(function(){ scrollHandler(); }, 500);
        //scrollHandler();
    };
})
.controller('DocSearchCtrl', function($scope, $http, $q, $location){
    var getQuery = function(query) {
        //console.log('query ' + query);
        //console.log('scope query ' + $scope.query);
        return {
  "query" : {
    "multi_match" : {
      "query" : query,
      "fields" : [ "ns^20", "name^20", "description^10", "resourcePath^20",  "function.description", "function.parameters", "function.return", "resource.path", "resource.description", "resource.summary", "resource.notes", "resource.parameters", 'metadata.label' ]
    }
  },
  "fields" : [ "ns", "resourcePath", "name", "parent", 'metadata'],
  "highlight" : { "tags_schema" : "styled", "fields" : {
    "ns" : {},
    "name" : {},
    "description" : {},
    "resourcePath" : {},
    "function.description" : {},
    "function.parameters" : {},
    "function.return" : {},
    "resource.path" : {},
    "resource.description" : {},
    "resource.summary" : {},
    "resource.notes" : {},
    "resource.parameters" : {}
  } }
};    
    };
    $scope.loading = false;
    $scope.results = [];
    
    $scope.onSelect = function($item, $model, $label){
        var raw = '/documentation/latest' + $model.href.substring(1);
        //var idx = raw.indexOf('?');
        //var path = raw.substring(0, idx);
        //var query = raw.substring(idx);
        $location.url(raw);
    };
    
    $scope.format = function(val) {
        return val;  
    };
    
    $scope.getHightlight = function(highlight) {
        return highlight[Object.keys(highlight)[0]][0];
    };
 
    var getAPIItem = function(name, index) {
        var result = undefined;
        index.children.forEach(function(child){
            if(child.id === 'api') {
                child.children.forEach(function(api){
                    if(api.id === name) {
                        result = api;
                    }
                });
            }
        });
        return result;
    };

    var results = [];
    $scope.getResults = function(val){
        $scope.loading = true;
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: 'https://144cba5027f46921000.qbox.io/searchonly/_search',
            data: getQuery(val)
        }).success(function(data){
            if(!$scope.$parent.index) {
                deferred.reject('index not found');
                return;
            }
            var index = $scope.$parent.index.versions[0];
            var hits = data.hits.hits.slice(0, 10);
            if(hits.length > 0) {
                results = [];
            }
            hits.forEach(function(hit){
                var r = {
                    type: hit._type
                    , highlight: hit.highlight ? hit.highlight[Object.keys(hit.highlight)[0]][0] : ''
                    , href: hit.fields.metadata.href
                    , label: hit.fields.metadata.label
                };
                results.push(r);
            });
            deferred.resolve(results);
            $scope.loading = false;
        }).error(function(data){
            deferred.reject(data);
            $scope.loading = false;
        });
        return deferred.promise;
    };
})
.controller('DocsCtrl', function($rootScope, $scope, $routeParams, $location, $http, panel) {
    
    var params = $location.search();
    $scope.debug = params.debug === 'true';
    $scope.debugURL = params.url;
    $scope.debugType = params.state;
   
    $scope.getItemHref = function(path, item) {
        if(item.href) {
            return item.href;
        } else {
            return path + '/' + item.id;
        }   
    };  
    
    $scope.getItemTarget = function(item) {
        return item.href ? '_blank' : ''; 
    };
 
    $scope.hasXQDocComment = function(fn){
        return fn.isDocumented === true;
    };
    
    $scope.getJSONURL = function(ns) {
        ns = ns.replace('http://', '').replace(/\//gi, '_');
        return '/documentation/'  + $scope.currentVersion.version + '-' + $scope.currentVersion.codename + '/modules/' + ns + '.json';
    };
    
    $scope.getXMLURL = function(ns) {
        ns = ns.replace('http://', '').replace(/\//gi, '_');
        return '/documentation/'  + $scope.currentVersion.version + '-' + $scope.currentVersion.codename + '/modules/xml/' + ns + '.xml';
    };
    
    $scope.getAPIJSONURL = function() {
        return '/documentation/' + $scope.currentVersion.version + '-' + $scope.currentVersion.codename + '/' + $scope.item.url;
    };
    
    $scope.needsAuth = function(operation){
        var result = false;
        operation.parameters && operation.parameters.forEach(function(param){
            if(param.name === 'token' && param.required === true) {
                result = true;
                return false;
            }
        });
        return result;
    };
    
    $scope.normalizeAnchor = function(html){
        return html.replace('href="?anchor=', 'href="' + $location.path() + '?anchor=')
        	.replace('href="#', 'href="' + $location.path() + '?anchor=')
    };
    
    var normalizePath = function(path){
        if(path && path[path.length - 1] === '/') {
            return path.substring(0, path.length - 1);
        } else {
            return path;
        }
    };

    $scope.panel = panel.clone();
    panel.reset();
    
    $scope.state = null;
    $scope.content = null;
    
    $scope.loading = true;
    $scope.currentVersion = null;
    
    $scope.itemURL = null;
    $scope.item = null;
    $scope.currentItem = [];
    $scope.children = [];
    
    $scope.uri =  normalizePath($routeParams.uri);
    $scope.currentPath = normalizePath($location.path());
    $scope.path = normalizePath($location.path());
    $scope.locationPath = $location.path();

    $scope.getBreadCrumbs = function(){
        var crumbs = [];
        var item = $scope.item;
        while(item.parent) {
            crumbs.push(item);
            item = item.parent;
        }
        crumbs.reverse().splice(0, 1);
        var path = [];
        crumbs.forEach(function(i){
            i.breadcumbs = path.concat([i.id]);
            path.push(i.id);
        });
        return crumbs;
    };

    var findMenu = function(segments, current) {
        if(segments.length === 0) {
            $scope.itemURL = current.url ? current.url : null;
            $scope.item = current;
            $scope.currentItem = current.children ? current : current.parent;
            if(!current.children) {
                var pathSegments = $scope.currentPath.split('/');
                $scope.path = pathSegments.slice(0, pathSegments.length - 1).join('/');
            }
        } else {
            $scope.menuParent = current.children;
            $scope.parentPtr = current.parent;
            current.children.forEach(function(v){
                if(segments[0] === v.id) {
                    findMenu(segments.slice(1), v);
                }
            });
        }
    };
    
    function addParentPtrs(tree, parent){
        if(tree === null) { return null; }
        tree.parent = parent;
        if(tree.children) {
            tree.children.forEach(function(child){
                addParentPtrs(child, tree);
            });
        }
        if(tree.versions) {
            tree.versions.forEach(function(child){
                addParentPtrs(child, tree);
            });
        }
        return tree;
    }
    
    var load = function(){
        if($scope.debug === true) {
            $scope.state = 'loading';
            if($scope.debugType === 'modules') {
                $http({ method: 'GET', url: $scope.debugURL }).success(function(data){
                    $http({ method: 'POST', url: 'http://documentation.28.io/debug.xq', data: data }).success(function(jqdoc){
                        $scope.content = jqdoc;
                        $scope.state = $scope.debugType;
                    });
                });
            } else {
                $http({ method: 'GET', url: $scope.debugURL }).success(function(data){
                    $scope.content = data;
                    $scope.state = $scope.debugType;
                });
            }
            return;
        }
    
        $scope.index = addParentPtrs(JSON.parse(localStorage.getItem('documentation')));
        if($scope.index !== null) {
            $scope.index.versions.forEach(function(v){
                if((v.latest === true && $routeParams.version === 'latest') ||
                   ($routeParams.version === v.version)) {
                    $scope.currentVersion = v;
                }
            });
            if($scope.currentVersion !== null) {
                findMenu(
                    $scope.uri === undefined ? [] : $scope.uri.split('/'),
                    $scope.currentVersion
                );
                if($scope.itemURL !== null) {
                    var url = '/documentation/' + $scope.currentVersion.version + '-' + $scope.currentVersion.codename + '/' + $scope.itemURL;
                    var type = $scope.itemURL.split('/')[0];
                        $scope.state = 'loading';
                        $http({
                            method: 'GET',
                            url: url
                        }).success(function(data){
                            $scope.state = type;
                            $scope.content = data;
                            $rootScope.$emit('$anchorScroll');
                        }).error(function(){
                            $scope.state = 'notfound';
                        });
                } else if($scope.item && $scope.item.ref) {
                    $scope.state = $scope.item.ref;
                } else if($scope.currentItem.length === 0) {
                    $scope.state = 'notfound';
                } else {
                    $scope.state = 'default';
                }
            } else {
                $scope.state = 'notfound';
            }
        }
    };

    $http({
        url: '/documentation/index.json',
        method: 'GET'
    }).success(function(data){
        $scope.loading = false;
        localStorage.setItem('documentation', JSON.stringify(data));
        load();
    });
    
    load();
    
    $scope.next = function(item){
        if(item.children){
            panel.status = 'next';
        }
    };

    $scope.previous = function() {
        panel.status = 'previous';
        panel.previous = $scope.currentItem;
    };
    
   $scope.getJSONURL = function (ns) {

       ns = ns.replace('http://', '').replace(/\//gi, '_');

       return '/documentation/' + $scope.currentVersion.version +
           '-' + $scope.currentVersion.codename + '/modules/' + ns + '.json';

   };


   $scope.getXMLURL = function (ns) {

       ns = ns.replace('http://', '').replace(/\//gi, '_');

       return '/documentation/' + $scope.currentVersion.version + '-' + $scope.currentVersion.codename + '/modules/xml/' + ns + '.xml';

   };


   $scope.getAPIJSONURL = function () {

       return '/documentation/' + $scope.currentVersion.version + '-' + $scope.currentVersion.codename + '/' + $scope.item.url;

   };


   $scope.getDoxygenXMLURL = function () {

       return '/documentation/' + $scope.currentVersion.version +
           '-' + $scope.currentVersion.codename + '/zorba/xml/' + $scope.item.id + '.xml';

   }


   $scope.getDoxygenURL = function () {
       return 'https://github.com/28msec/zorba/blob/master/doc/zorba/' + $scope.item.id + '.dox';
   }
});
