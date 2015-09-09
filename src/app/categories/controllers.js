'use strict';

function CategoriesListeController($scope, $rootScope, $location, $timeout,  utilsFactory, globalSettings, categoriesService, filtersService) {

    var initFiltersEvent = $rootScope.$on('updateFilters', initFilters);

    $scope.extend = false;
    $scope.filtering = false;

    function initFilters() {
        initDatePickers();
        initRangeFilters();

        //disable event
        initFiltersEvent();
    }

    function updateFiltersTags() {
        $rootScope.activeFiltersTags = filtersService.getTagFilters();
    }

    function loadCategories(forceRefresh) {
        categoriesService.getNonExcludedCategories(forceRefresh)
            .then(
                function (categories) {
                    $scope.categories = categories;
                }
            );
    }

    function resetRangeFilter(filter) {
        filter.min = 0;
        filter.max = filter.values.length - 1;
    }

    function initRangeValues(categoryId, filter, filterName) {
        var uid = categoryId + '_' + filterName;
        var activeFilters = filtersService.getActiveFilters();
        var valuesLength = filter.values.length;

        $scope.activeRangeValues[uid] = {
            floor: 0,
            ceil: valuesLength - 1,
            values: filter.values
        };
        if (activeFilters && activeFilters[uid]) {
            var minValue = activeFilters[uid][0].split('-')[0],
                maxValue = activeFilters[uid][0].split('-')[1],
                minIndex = 0,
                maxIndex = valuesLength - 1;

            angular.forEach(filter.values, function (value, valueIndex) {
                if (value.id.toString() === minValue.toString()) {
                    minIndex = valueIndex;
                }

                if (value.id.toString() === maxValue.toString()) {
                    maxIndex = valueIndex;
                }
            });

            $scope.activeRangeValues[uid].min = minIndex;
            $scope.activeRangeValues[uid].max = maxIndex;
        } else {
            $scope.activeRangeValues[uid].min = 0;
            $scope.activeRangeValues[uid].max = valuesLength - 1;
        }
    }

    function initRangeFilters() {
        var categories = $scope.categories;

        $scope.activeRangeValues = {};

        for (var i = categories.length - 1; i >= 0; i--) {
            var category = categories[i];

            angular.forEach(category, function (property, propertyName) {
                if (property && property.type && property.type === 'range') {

                    initRangeValues(category.id, property, propertyName);

                }
            });
        }

        $scope.$watch('activeRangeValues', function () {
            if ($scope.rangeUpdate) {
                $timeout.cancel($scope.rangeUpdate);
            }
            $scope.rangeUpdate = $timeout(function () {
                $scope.updateActiveRangeFilters();
            }, 300);
        }, true);

        $scope.$on('resetRange', function (event, data) {
            var filter = data.filter;
            var rangeFilters = $scope.activeRangeValues;
            _.forEach(rangeFilters, function (rangeFilter, rangeFilterName) {

                if (filter === 'all' || rangeFilterName.toString() === filter.toString()) {
                    resetRangeFilter(rangeFilter);
                }

            });
            $scope.activeRangeValues = rangeFilters;
        });
    }

    function initDateValues() {
        var categories = $scope.categories;

        for (var i = categories.length - 1; i >= 0; i--) {
            var category = categories[i];

            angular.forEach(category, function (property, propertyName) {

                var filterName = category.id + '_' + propertyName;
                var activeFilter = $scope.activeFilters[filterName];

                if (activeFilter && (propertyName === 'begin_date' || propertyName === 'end_date')) {
                    $scope.activeDateFilters[filterName] = new Date(activeFilter);
                }
            });
        }
    }

    function initDatePickers() {
        $scope.activeDateFilters = {};

        initDateValues();

        $scope.$watch('activeDateFilters', function () {
            $scope.updateActiveDateFilters();
        }, true);
    }

    $scope.disableDateFilter = function (dateFilterName) {
        $scope.activeDateFilters[dateFilterName] = null;

        $scope.updateActiveDateFilters();
    };

    $scope.updateActiveDateFilters = function () {
        angular.forEach($scope.activeDateFilters, function (filterValues, filterName) {
            if (filterValues) {
                $rootScope.activeFilters[filterName] = filterValues.toISOString();
            } else {
                $rootScope.activeFilters[filterName] = null;
            }
        });

        $scope.propagateActiveFilters();
    };

    $scope.updateActiveRangeFilters = function () {
        angular.forEach($scope.activeRangeValues, function (filterValues, filterName) {
            var minIndex = filterValues.min,
                maxIndex = filterValues.max;
            if (minIndex !== 0 || maxIndex !== filterValues.values.length - 1) {
                var min = filterValues.values[minIndex].id.toString();
                var max = filterValues.values[maxIndex].id.toString();
                $rootScope.activeFilters[filterName] = [min + '-' + max];
            } else {
                $rootScope.activeFilters[filterName] = null;
            }
        });

        $scope.propagateActiveFilters();
    };

    $scope.activateCategory = function (category) {
        var categories = $rootScope.activeFilters.categories,
            indexOfCategory = categories.indexOf(category.id.toString());
        if (indexOfCategory < 0) {
            if (globalSettings.ENABLE_UNIQUE_CAT) {
                $rootScope.activeFilters.categories = [];
            }
            $rootScope.activeFilters.categories.push(category.id.toString());
        }
        $scope.propagateActiveFilters();
    };

    $scope.deactivateCategory = function (category) {
        var categories = $rootScope.activeFilters.categories,
            indexOfCategory = categories.indexOf(category.id.toString());
        if (indexOfCategory > -1) {
            categories.splice(indexOfCategory, 1);
        }
        $scope.propagateActiveFilters();
    };

    $scope.toggleCategory = function (category) {
        var categories = $rootScope.activeFilters.categories,
            indexOfCategory = categories.indexOf(category.id.toString());
        if (indexOfCategory > -1) {
            categories.splice(indexOfCategory, 1);
        } else {
            if (globalSettings.ENABLE_UNIQUE_CAT) {
                $rootScope.activeFilters.categories = [];
            }
            $rootScope.activeFilters.categories.push(category.id.toString());
        }
        $scope.propagateActiveFilters();
    };

    $scope.toogleCategoryFilter = function (categoryId, filterType, filterId) {
        var categoryFilter = $rootScope.activeFilters[categoryId + '_' + filterType];

        if (categoryFilter) {
            var indexOfFilter = categoryFilter.indexOf(filterId.toString());
            if (indexOfFilter > -1) {
                categoryFilter.splice(indexOfFilter, 1);
            } else {
                $rootScope.activeFilters[categoryId + '_' + filterType].push(filterId.toString());
            }
        } else {
            $rootScope.activeFilters[categoryId + '_' + filterType] = [filterId.toString()];
        }
        $scope.propagateActiveFilters();
    };

    $scope.closeCategoryFilters = function (category) {
        $scope.filtering = false;
        if (category) {
            category.open = false;
        } else {
            _.forEach($scope.categories, function (category) {
                category.open = false;
            });
        }
    };

    $scope.openCategoryFilters = function (category) {
        category.open    = true;
        $scope.filtering = true;
        hideSiblings(category);
    };

    var hideSiblings = function (mainCategory) {
        _.forEach($scope.categories, function (category) {
            if (category.id !== mainCategory.id) {
                category.open = false;
            }
        });
    };

    $scope.propagateActiveFilters = function () {
        filtersService.updateActiveFilters($rootScope.activeFilters);
        if (globalSettings.SHOW_FILTERS_ON_MAP) {
            updateFiltersTags();
        }
        $rootScope.$broadcast('updateFilters');
    };

    $scope.toggleCategories = function () {
        $scope.extend = !$scope.extend;
        if (!$scope.extend) {
            $scope.closeCategoryFilters();
        }
    }
    $scope.extendCategories = function () {
        $scope.extend = true;
    }

    $scope.foldCategories = function () {
        $scope.extend = false;
        $scope.closeCategoryFilters();
    }

    $scope.isSVG = utilsFactory.isSVG;

    loadCategories();

    var rootScopeEvents = [
        $rootScope.$on('switchGlobalLang', function () {
            loadCategories(true);
        })
    ];

    $scope.$on('$destroy', function () { rootScopeEvents.forEach(function (dereg) { dereg(); }); });

}

module.exports = {
    CategoriesListeController: CategoriesListeController
};