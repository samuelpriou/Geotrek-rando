'use strict';

function settingsFactory(globalSettings) {

    // PRIVATE VAR
    //
    var _activeLang = globalSettings.DEFAULT_LANGUAGE;


    // PUBLIC VAR
    //
    var treksUrl =  globalSettings.DOMAIN + '/' + globalSettings.API_DIR + '/' + globalSettings.TREK_DIR + '/',
        poisUrl =  globalSettings.DOMAIN + '/' + globalSettings.API_DIR + '/' + globalSettings.POI_DIR + '/',
        eventsUrl =  globalSettings.DOMAIN + '/' + globalSettings.API_DIR + '/' + globalSettings.TOURISTIC_EVENTS_DIR + '/',
        touristicUrl =  globalSettings.DOMAIN + '/' + globalSettings.API_DIR + '/' + globalSettings.TOURISTIC_CONTENTS_DIR + '/';

    //PUBLIC METHODS
    //
    var setLang = function (newLang) {
        _activeLang = newLang;
        return true;
    };

    var getLang = function () {
        return _activeLang;
    };



    return {

        //PUBLIC VAR
        treksUrl: treksUrl,
        poisUrl: poisUrl,
        eventsUrl: eventsUrl,
        touristicUrl: touristicUrl,

        //METHODS
        setLang: setLang,
        getLang: getLang

    };

}

module.exports = {
    settingsFactory: settingsFactory
};