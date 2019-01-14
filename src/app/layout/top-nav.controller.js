(function() {
    'use strict';

    angular
        .module('app.topnav',['app.core'])
        .controller('TopNavController', TopNavController);

    TopNavController.$inject = ['$rootScope','$scope', 'logger','NdnService'];

    function TopNavController($rootScope, $scope, logger, NdnService ) {
        var vm = this;
        $scope.items = [
            'The first choice!',
            'And another choice for you.',
            'but wait! A third!'
        ];

        $scope.status = {
            isopen: false
        };

        $scope.toggled = function(open) {
            logger.log('Dropdown is now: ', open);
        };

        $scope.toggleDropdown = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.status.isopen = !$scope.status.isopen;
        };

        $scope.search = function(){
            NdnService.expressInterest($scope.namedSearch, onDataSearch);
        };

        function onDataSearch(interest, data)
        {
            var results = JSON.parse(data.getContent().buf().toString('binary'));
            NdnService.searchResult = results;
            $rootScope.$broadcast('postListUpdated');
        }
    }
})();
