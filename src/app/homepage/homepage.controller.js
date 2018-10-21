(function () {
    'use strict';

    angular
        .module('app.homepage',[
            'app.core'
        ])
        .controller('HomepageController', HomepageController);

    HomepageController.$inject = [];

    function HomepageController() {

        var vm = this;

        activate();

        function activate(){

        }
    }
})();
