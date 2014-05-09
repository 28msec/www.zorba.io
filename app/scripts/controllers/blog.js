'use strict';

angular.module('28.ioApp').controller('BlogCtrl', function($scope, $routeParams, $location, $http) {

    $scope.wemail = $location.search().wemail;
    $location.search({});
    $scope.index = { entries: [] };

    $scope.id = function(id) {
        return id.split('/')[1];
    };

    $scope.cols = [0, 1, 2];
    $scope.itemsPerCol = $scope.cols.length;
    
    $scope.tagFilter = null;
    $scope.idFilter = null;
    
    $scope.getEntriesfrom = function(col) {
        var entries = [];
        var rows = Math.ceil($scope.index.entries.length / $scope.itemsPerCol);
        for(var i = 0; i < rows; i++) {
            var entry = $scope.entries[(i * $scope.itemsPerCol) + col];
            if(entry) {
                entries.push(entry);
            }
        }
        return entries;
    };
    
    $scope.formatDate = function(dateStr){
        var date = new Date(dateStr);
        var current = new Date();
        var timeDiff = Math.abs(current.getTime() - date.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if(diffDays > 365) {
            var years = Math.floor(diffDays / 365);
            return  years + (years > 1 ? ' years' : ' year');
        } else if(diffDays > 30) {
            var months = Math.floor(diffDays / 30);
            return months + (months > 1 ? ' months' : ' month');
        } else {
            return diffDays + (diffDays > 1 ? ' day' : ' days');
        }
    };
    
    var load = function(){
        var index = localStorage.getItem('index');
        if(index !== null) {
            $scope.index = JSON.parse(index);
        }
        
        var entries = [];
        if($routeParams.id !== undefined) {
            var id = '/' + $routeParams.id + '/' + $routeParams.slug;
            $scope.idFilter = id;
            $scope.index.entries.forEach(function(entry){
                if(entry.id === id) {
                    entries.push(entry);
                }
            });
        } else if($routeParams.tag !== undefined) {
            $scope.tagFilter = $routeParams.tag;
            $scope.index.entries.forEach(function(entry){
                if(entry.tags.indexOf($routeParams.tag) !== -1) {
                    entries.push(entry);
                }
            });
        } else {
            entries = $scope.index.entries;
        }
        
        $scope.entries = entries;
    };

    $scope.loading = true;
    
    $http({
        url: '/blog/index.json',
        method: 'GET'
    }).success(function(data){
        $scope.loading = false;
        localStorage.setItem('index', JSON.stringify(data));
        load();
    });
    
    load();
    
    $scope.$on('$viewContentLoaded', function() {
        //loadDisqus();
    });
});