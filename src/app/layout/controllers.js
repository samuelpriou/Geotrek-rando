'use strict';

function LayoutController($rootScope, $state) {
    $rootScope.$on("$stateChangeSuccess",  function (event, toState, toParams, fromState, fromParams) {
        // to be used for back button //won't work when page is reloaded.
        $rootScope.previousState_name = fromState.name;
    });
    //back button function called from back button's ng-click="back()"
    $rootScope.back = function () {
        if (!$rootScope.previousState_name) {
            $state.go('layout.root');
        } else {
            window.history.back();
        }
    };
}

function HeaderController() {
}

function SidebarHomeController() {
}

function SidebarDetailController($scope, $rootScope, $stateParams, resultsService, favoritesService) {

    function getResultDetails() {
        resultsService.getAResult($stateParams.slug)
            .then(
                function (data) {
                    $scope.result = data;
                }
            );
    }

    $scope.toggleFavorites = function (currentElement) {
        var currentAction = '';
        if (favoritesService.isInFavorites(currentElement)) {
            currentAction = 'remove';
        } else {
            currentAction = 'add';
        }
        $rootScope.$broadcast('changeFavorite', {element: currentElement, action: currentAction});
    };

    $scope.isInFavorites = favoritesService.isInFavorites;

    $scope.back = $rootScope.back;

    getResultDetails();

}

function FooterController() {
}


module.exports = {
    LayoutController: LayoutController,
    HeaderController: HeaderController,
    SidebarHomeController: SidebarHomeController,
    SidebarDetailController: SidebarDetailController,
    FooterController: FooterController
};