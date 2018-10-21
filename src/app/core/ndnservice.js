/* jshint -W101 */
/* jshint -W071 */
(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('NdnService', NdnService);

    NdnService.$inject = [ '$http','$cookies','config','logger'];

    function NdnService( $http, $cookies, config, logger) {
        var service = {
            expressInterest : expressInterest
        };


        if (window.location.hostname === '127.0.0.1') {
            service.environment = 'dev';
        }

        return service;

        function postService(url, testUrl, data, hideOverlay, optionalFail) {

        }

        function expressInterest(nameInterest, onDataCallback) {
            if(service.environment == 'dev'){
                return $http({
                    method: 'GET',
                    url : '../data/'+nameInterest+'.json',
                    responseType : 'json'
                }).then(success).catch(fail);
            }else{
                var face = new Face({host: config.ndnhost});
                var name = new Name(nameInterest);
                logger.info("Express name " + name.toUri());
                face.expressInterest(name, onDataCallback, onTimeout);
            }


            function success(response) {
                var data = new Data(nameInterest);
                data.setContent(JSON.stringify(response.data));
                onDataCallback(null,data);
            }

            function fail(error) {
                return error;
            }
        }

        function onTimeout(interest)
        {
            logger.error("Time out for interest " + interest.getName().toUri());
        }
    }
})();
