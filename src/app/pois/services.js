'use strict';

function poisService($resource, $q, globalSettings, settingsFactory, translationService) {

    var self = this;

    this.refactorPois = function (poisData) {
        // Parse trek pictures, and change their URL
        _.forEach(poisData.features, function (poi) {

            if (poi.properties.pictures && poi.properties.pictures[0]) {
                _.forEach(poi.properties.pictures, function (picture) {
                    if (picture.url !== null) {
                        picture.url = globalSettings.DOMAIN + '/' + globalSettings.DATA_DIR + picture.url;
                    }
                });
            }
            if (poi.properties.filelist_url && poi.properties.filelist_url !== null) {
                poi.properties.filelist_url = globalSettings.DOMAIN + '/' + globalSettings.DATA_DIR + poi.properties.filelist_url;
            }
            if (poi.properties.map_image_url && poi.properties.map_image_url !== null) {
                poi.properties.map_image_url = globalSettings.DOMAIN + '/' + globalSettings.DATA_DIR + poi.properties.map_image_url;
            }
            if (poi.properties.printable && poi.properties.printable !== null) {
                poi.properties.printable = globalSettings.DOMAIN + '/' + globalSettings.DATA_DIR + poi.properties.printable;
            }
            if (poi.properties.thumbnail && poi.properties.thumbnail !== null) {
                poi.properties.thumbnail = globalSettings.DOMAIN + '/' + globalSettings.DATA_DIR + poi.properties.thumbnail;
            }
            if (poi.properties.type.pictogram && poi.properties.type.pictogram !== null) {
                poi.properties.type.pictogram = globalSettings.DOMAIN + '/' + globalSettings.DATA_DIR + poi.properties.type.pictogram;
            }

        });
        return poisData;
    };

    this.getPois = function (forceRefresh) {

        var deferred = $q.defer();

        if (self._pois && !forceRefresh) {

            deferred.resolve(self._pois);

        } else {
            var url = settingsFactory.poisUrl.replace(/\$lang/, translationService.getCurrentLang().code);

            var requests = $resource(url, {}, {
                query: {
                    method: 'GET',
                    cache: !forceRefresh,
                }
            }, {stripTrailingSlashes: false});

            requests.query().$promise
                .then(function (file) {
                    var data = angular.fromJson(file);
                    var refactoredPois = self.refactorPois(data);
                    self._pois = refactoredPois;
                    deferred.resolve(self._pois);
                });

        }

        return deferred.promise;

    };

    this.getPoisFromElement = function (elementId, forceRefresh) {

        var deferred = $q.defer();

        var url = settingsFactory.trekUrl.replace(/\$lang/, translationService.getCurrentLang().code) + '/' + elementId + '/' + globalSettings.POI_FILE;

        var requests = $resource(url, {}, {
            query: {
                method: 'GET'
            }
        }, {stripTrailingSlashes: false});

        requests.query().$promise
            .then(function (file) {
                var data = angular.fromJson(file);
                var refactoredPois = self.refactorPois(data);
                deferred.resolve(refactoredPois);
            });

        return deferred.promise;
    };

}

module.exports = {
    poisService: poisService
};