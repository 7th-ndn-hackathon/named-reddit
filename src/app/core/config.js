(function () {
    'use strict';

    var core = angular.module('app.core');

    core.config(toastrConfig);

    toastrConfig.$inject = ['toastr'];

    function toastrConfig(toastr) {
        toastr.options.timeOut = 4000;
        toastr.options.positionClass = 'toast-bottom-right';
    }

    var config = {
        ndnhost : "localhost",
        appTitle: "NDN Reddit",
        appVersion: "0.01",
        appDate: 'Thu Aug 30 2018 16:32:02 GMT-0500 (Central Daylight Time)'
    };

    core.value('config', config);

    core.config(configure);

    configure.$inject = ['$logProvider'];

    function configure($logProvider) {
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }
    }

})();
