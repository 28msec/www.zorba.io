'use strict';

angular.module('sidePanel', []).factory('panel', function(){
    return {
        status: 'current',
        previous: null,
        clone: function() {
            return {
                status: this.status,
                previous: this.previous
            };
        },
        reset: function(){
            this.status = 'current';
            this.previous = null;
        }
    };
});