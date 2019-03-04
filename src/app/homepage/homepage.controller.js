(function () {
    'use strict';

    angular
        .module('app.homepage',[
            'app.core'
        ])
        .controller('HomepageController', HomepageController);
        //.run(ConfigureRoute);

   /* ConfigureRoute.$inject = ['routerHelper'];
    function ConfigureRoute(routerHelper) {
        routerHelper.configureStates([
            {
                state: 'homepage',
                config: {
                    url: '/',
                    templateUrl: 'app/homepage/homepage.html',
                    title: 'Homepage'
                }
            }
        ]);
    }*/

    HomepageController.$inject = ['$rootScope','$scope', 'logger','NdnService'];

    function HomepageController($rootScope, $scope, logger, NdnService ) {

        var vm = this;
        $scope.posts = [];
        activate();

        function activate(){

        }

        $scope.postClick = function(post){
            console.log("route to post" + post);
        };

        $scope.$on('postListUpdated', function(){
            $scope.posts = NdnService.searchResult.posts;
        });
    }
})();
