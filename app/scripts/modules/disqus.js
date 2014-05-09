'use strict';

angular.module('disqus', []).directive('disqus', function($location){
    return function($scope, elm) {
      // http://docs.disqus.com/help/2/
        window.disqus_shortname = 'zorba';
        var disqusIdentifier = elm[0].getAttribute('disqus-identifier');
        window.disqus_identifier = disqusIdentifier ? disqusIdentifier : $location.path();
        window.disqus_url = 'http://www.zorba.io' + window.disqus_identifier;

//            window.disqus_developer = 1;

    // http://docs.disqus.com/developers/universal/
        
        if(!document.getElementById('disqusScript')) {
            var dsq = document.createElement('script');
            dsq.disqusScript = true;
            dsq.type = 'text/javascript';
            dsq.async = true;
            dsq.src = 'http://zorba.disqus.com/embed.js';
            document.getElementsByTagName('body')[0].appendChild(dsq);
        }
        angular.element(document.getElementById('disqus_thread')).html('');
    };
});
