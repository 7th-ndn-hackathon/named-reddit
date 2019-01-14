(function () {
    'use strict';

    angular
        .module('app.core', [
            'ngAnimate', 'ngSanitize', 'ngMessages', 'ngTouch',
            'core.logger','core.router',
            'ui.router', 'ngplus', 'angular.filter', 'ui.bootstrap', 'ngCookies'
        ])
        .constant('toastr', toastr)
        .constant('moment', moment)
        .directive('ngEnter', function() {
            return function(scope, element, attrs) {
                element.bind("keydown keypress", function(event) {
                    if(event.which === 13) {
                        scope.$apply(function(){
                            scope.$eval(attrs.ngEnter, {'event': event});
                        });

                        event.preventDefault();
                    }
                });
            };
        })
        .run(ConfigureRoute);

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
            }
        ]);
    }
})();
