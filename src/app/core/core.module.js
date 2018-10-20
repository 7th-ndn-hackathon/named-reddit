(function () {
    'use strict';

    angular
        .module('app.core', [
            'ngAnimate', 'ngSanitize', 'ngMessages', 'ngTouch',
            'blocks.exception', 'blocks.logger', 'blocks.router',
            'ui.router', 'ngplus', 'angular.filter', 'ui.grid', 'ui.bootstrap', 'ngCookies'
        ]).run(ConfigureRoute);

    ConfigureRoute.$inject = ['routerHelper'];
    function ConfigureRoute(routerHelper) {
        routerHelper.configureStates([
            {
                state: '404',
                config: {
                    url: '/404',
                    templateUrl: 'app/core/404.html',
                    title: '404'
                }
            },
            {
                state: 'homepage',
                config: {
                    url: '',
                    redirectTo:'search'
                }
            }
        ]);
    }
})();
