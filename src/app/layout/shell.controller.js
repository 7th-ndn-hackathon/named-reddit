(function() {
    'use strict';

    angular
        .module('app.layout',['app.core'])
        .controller('ShellController', ShellController);

    ShellController.$inject = ['$rootScope', '$timeout', 'logger','config'];

    function ShellController($rootScope, $timeout, logger, config) {
        var vm = this;
        vm.busyMessage = 'Please wait ...';
        vm.isBusy = true;
        $rootScope.showSplash = true;
        vm.navline = {
            title: config.appTitle,
            text: ''
        };
        vm.appName = config.appTitle;
        vm.appVersion = config.appVersion;
        activate();

        function activate() {
            logger.success(config.appTitle + ' loaded!', null);
            hideSplash();
           console.log('running version: ' + config.appVersion);
           console.log('build date: ' + config.appDate);

        }

        function hideSplash() {
            //Force a 1 second delay so we can see the splash.
            $timeout(function() {
                $rootScope.showSplash = false;
            }, 1000);
        }
    }
})();
