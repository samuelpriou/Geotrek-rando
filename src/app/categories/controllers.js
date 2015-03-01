'use strict';

function CategoriesListeController($scope, $rootScope, $location, globalSettings, categoriesService) {

    function updateCategories() {
        var currentQuery = $location.search();
        _.forEach($scope.categories, function (category) {

            category.active = false;
            category.filters = {};
            if (currentQuery.categories) {
                var categoriesArray = currentQuery.categories;

                if (typeof categoriesArray === 'string') {
                    categoriesArray = [categoriesArray];
                }

                _.forEach(categoriesArray, function (filter) {
                    if (parseInt(category.id, 10) === parseInt(filter, 10)) {
                        category.active = true;
                    }
                });

                _.forEach(currentQuery, function (filter, filterName) {
                    if (filterName.indexOf('_') > -1) {
                        var categoryId = filterName.split('_')[0],
                            filterKey = filterName.split('_')[1];
                        if (parseInt(categoryId, 10) === parseInt(category.id, 10)) {
                            if (typeof filter === 'string') {
                                filter = [filter];
                            }

                            _.forEach(filter, function (filterValue) {
                                if (!category.filters[filterKey]) {
                                    category.filters[filterKey] = {};
                                }

                                var capture = filterValue.toString().match(/^(\d+)-(\d+)$/i);
                                if (capture) {
                                    var minIndex,
                                        maxIndex;
                                    category.filters[filterKey] = {};
                                    category.filters[filterKey][filterValue] = true;
                                    _.forEach(category[filterKey].values, function (currentFilter, index) {
                                        if (parseInt(currentFilter.id, 10) === parseInt(capture[1], 10)) {
                                            minIndex = index;
                                        }

                                        if (parseInt(currentFilter.id, 10) === parseInt(capture[2], 10)) {
                                            maxIndex = index;
                                        }
                                    });
                                    category[filterKey].min = minIndex;
                                    category[filterKey].max = maxIndex;
                                } else {
                                    category.filters[filterKey][filterValue] = true;
                                }
                            });
                        }
                    }
                });

            } else {
                if (typeof globalSettings.DEFAULT_ACTIVE_CATEGORIES === 'string') {
                    globalSettings.DEFAULT_ACTIVE_CATEGORIES = [globalSettings.DEFAULT_ACTIVE_CATEGORIES];
                }

                _.forEach(globalSettings.DEFAULT_ACTIVE_CATEGORIES, function (filter) {
                    if (parseInt(category.id, 10) === parseInt(filter, 10)) {
                        category.active = true;
                    }
                });

            }

        });
    }

    function resetRangeFilter(filter) {
        filter.min = 0;
        filter.max = filter.values.length - 1;
    }

    function initRangeFilters() {

        _.forEach($scope.categories, function (category) {
            _.forEach(category, function (property, propertyName) {
                if (property.type && property.type === 'range') {

                    if (property.values.length > 1) {
                        resetRangeFilter(property);
                        $scope.$watchGroup(
                            [
                                function () {
                                    return property.min;
                                },
                                function () {
                                    return property.max;
                                }
                            ],
                            function () {
                                var minIndex = property.min,
                                    maxIndex = property.max;
                                category.filters[propertyName] = {};
                                if (minIndex !== 0 || maxIndex !== property.values.length - 1) {
                                    var min = property.values[minIndex].id.toString();
                                    var max = property.values[maxIndex].id.toString();
                                    category.filters[propertyName][min + '-' + max] = true;
                                } else {
                                    category.filters[propertyName]['0-max'] = false;
                                }
                                $scope.propagateFilters();
                            },
                            true
                        );
                        $scope.$on('resetRange', function (event, data) {
                            var eventCategory = data.category,
                                filter = data.filter;

                            _.forEach($scope.categories, function (currentCategory) {
                                if (parseInt(currentCategory.id, 10) === parseInt(eventCategory, 10)) {
                                    if (filter === 'all') {
                                        _.forEach(currentCategory, function (currentFilter, currentFilterName) {
                                            if (currentFilter.type === 'range') {
                                                resetRangeFilter(currentCategory[currentFilterName]);
                                            }
                                        });
                                    } else if (currentCategory[filter]) {
                                        resetRangeFilter(currentCategory[filter]);
                                    }
                                }

                            });

                        });
                    }

                }
            });
        });
    }

    function loadCategories() {
        categoriesService.getCategories()
            .then(
                function (data) {
                    $scope.categories = data;
                    initRangeFilters();
                    updateCategories();
                    $rootScope.$on('updateFilters', updateCategories);
                }
            );
    }

    $scope.toggleCategory = function (category) {
        category.active = !category.active;
        $scope.propagateFilters();
    };

    $scope.propagateFilters = function () {
        var currentQuery = $location.search(),
            activeCategories = [];
        _.forEach($scope.categories, function (category) {
            if (category.active) {
                activeCategories.push(category.id);
                _.forEach(category.filters, function (filter, filterKey) {
                    var filterIsNotEmpty = false;
                    var currentFilterValues = [];
                    _.forEach(filter, function (value, valueKey) {

                        if (value) {
                            filterIsNotEmpty = true;
                            currentFilterValues.push(valueKey);
                        }
                    });
                    if (filterIsNotEmpty) {
                        currentQuery[category.id + '_' + filterKey] = currentFilterValues;
                    } else {
                        delete currentQuery[category.id + '_' + filterKey];
                    }
                });
            } else {
                _.forEach(category.filters, function (filter, filterKey) {
                    if (currentQuery[category.id + '_' + filterKey]) {
                        delete currentQuery[category.id + '_' + filterKey];
                    }
                });
            }
        });

        currentQuery.categories =  activeCategories;
        $location.search(currentQuery);
        $rootScope.$broadcast('updateFilters');
    };

    loadCategories();

}

module.exports = {
    CategoriesListeController: CategoriesListeController
};