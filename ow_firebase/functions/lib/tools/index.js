"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const request = require('request-promise-native');
const ow_translations_1 = require("ow_translations");
function getToken(admin) {
    return __awaiter(this, void 0, void 0, function* () {
        return admin.auth().createCustomToken('12345')
            .then(function (customToken) {
            const options = {
                json: true,
                url: `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=${process.env.WEB_API_KEY}`,
                method: 'POST',
                body: {
                    token: customToken,
                    returnSecureToken: true
                },
            };
            return request(options);
        })
            .then(response => {
            return response.idToken;
        })
            .catch(function (error) {
            console.log("Error creating custom token:", error);
        });
    });
}
exports.getToken = getToken;
function getAuthHeader(admin) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = yield getToken(admin);
        return {
            Authorization: `Bearer ${token}`
        };
    });
}
exports.getAuthHeader = getAuthHeader;
const { JWT } = require('google-auth-library');
//TODO: make the user specify the key
// const key = {
//   client_email: '12345',
//   private_key: '12345',
// };
/**
 * getAdminAccessToken
 *
 * Gets the admin access token for using firebase admin tools.
 */
function getAdminAccessToken(key) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new JWT(key.client_email, null, key.private_key, ['https://www.googleapis.com/auth/firebase.remoteconfig'], null);
        try {
            const result = yield client.authorize();
            console.log(result);
            return result.access_token;
        }
        catch (err) {
            return Promise.reject(err);
        }
    });
}
exports.getAdminAccessToken = getAdminAccessToken;
/**
 * getBackupAccessToken
 *
 * Gets the access token for triggering a backup
 */
function getBackupAccessToken(backupKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const scopes = [
            'https://www.googleapis.com/auth/datastore',
            'https://www.googleapis.com/auth/cloud-platform'
        ];
        //TODO: this may need a different key
        const client = new JWT(backupKey.client_email, null, backupKey.private_key, scopes, null);
        try {
            const result = yield client.authorize();
            console.log(result);
            return result.access_token;
        }
        catch (err) {
            return Promise.reject(err);
        }
    });
}
exports.getBackupAccessToken = getBackupAccessToken;
/**
 * getRemoteConfig
 *
 * Gets the current remote config settings
 *
 * curl --compressed -D headers -H "Authorization: Bearer token" -X GET https://firebaseremoteconfig.googleapis.com/v1/projects/my-project-id/remoteConfig -o filename
 *
 * returns a tuple: 0-> etag 1 -> config
 */
function getRemoteConfig(projectId, token) {
    return __awaiter(this, void 0, void 0, function* () {
        let etag, currentConfig;
        const etagRequestOptions = {
            headers: {
                Authorization: `Bearer ${token}`,
                'Accept-Encoding': 'gzip',
            },
            uri: `https://firebaseremoteconfig.googleapis.com/v1/projects/${projectId}/remoteConfig`,
            simple: false,
            resolveWithFullResponse: true,
        };
        const options = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            uri: `https://firebaseremoteconfig.googleapis.com/v1/projects/${projectId}/remoteConfig`,
        };
        /*
          API only returns etag with the gzip encoding.
          we make two requests to make this whole thing easier
        */
        return request(options)
            .then(_currentConfig => {
            currentConfig = _currentConfig;
            return request(etagRequestOptions);
            // console.log('rawResponse', rawResponse.headers);
            // const parsedResponse = rawResponse.toJSON();
            // const etag = rawResponse.headers.etag;
            // return [ etag, parsedResponse];
        })
            .then(rawResponse => {
            // console.log('rawResponse', rawResponse.headers);
            // const parsedResponse = rawResponse.toJSON();
            etag = rawResponse.headers.etag;
            return [etag, currentConfig];
        })
            .catch(err => {
            console.log('Error', err.message);
            return Promise.reject(err);
        });
    });
}
exports.getRemoteConfig = getRemoteConfig;
/**
 * saveNewConfig
 *
 * Save the new config to firebase
 * curl --compressed -H "Content-Type: application/json; UTF8" -H "If-Match: last-returned-etag" -H "Authorization: Bearer token" -X PUT https://firebaseremoteconfig.googleapis.com/v1/projects/my-project-id/remoteConfig -d @filename
 */
function saveNewConfig(token, etag, projectId, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json; UTF8',
                'If-Match': etag,
                Authorization: `Bearer ${token}`,
            },
            uri: `https://firebaseremoteconfig.googleapis.com/v1/projects/${projectId}/remoteConfig`,
            body: JSON.stringify(config),
        };
        return request(options)
            .then(response => {
            console.log(response);
            return response;
        })
            .catch(err => {
            console.log(err.message);
            return Promise.reject(err);
        });
    });
}
exports.saveNewConfig = saveNewConfig;
//TODO: adapt these to also have 
function buildParameter(deflt, description, conditions, values) {
    const wrapValue = (value) => {
        if (typeof value === 'boolean') {
            return `${value}`;
        }
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return value;
    };
    const conditionalValues = {};
    conditions.forEach((cdn, idx) => {
        const value = wrapValue(values[idx]);
        conditionalValues[cdn] = { value };
    });
    return {
        "defaultValue": {
            "value": wrapValue(deflt),
        },
        conditionalValues,
        description,
    };
}
/**
 * getNewConfig
 *
 * Build and return the new remote config
 */
function getNewConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        const conditionKeys = ['ggmn_android', 'ggmn_dev_android', 'mywell_android'];
        const mywellTranslationOptionsJSON = JSON.stringify(ow_translations_1.possibleTranslationsForOrg(ow_translations_1.TranslationOrg.mywell), null, 2);
        const mywellTranslationsJSON = JSON.stringify(ow_translations_1.translationsForTranslationOrg(ow_translations_1.TranslationOrg.mywell), ow_translations_1.functionReplacer, 2);
        const ggmnTranslationsOptionsJSON = JSON.stringify(ow_translations_1.possibleTranslationsForOrg(ow_translations_1.TranslationOrg.ggmn), null, 2);
        const ggmnTranslationsJSON = JSON.stringify(ow_translations_1.translationsForTranslationOrg(ow_translations_1.TranslationOrg.ggmn), ow_translations_1.functionReplacer, 2);
        const conditions = [
            {
                "name": "ggmn_android",
                "expression": "app.id == '1:276292750755:android:d585f9c74dcfe925' && device.os == 'android'",
                "tagColor": "BLUE"
            },
            {
                "name": "ggmn_dev_android",
                "expression": "app.id == '1:276292750755:android:b9afcac37667ce3e' && device.os == 'android'",
                "tagColor": "BROWN"
            },
            {
                "name": "mywell_android",
                "expression": "app.id == '1:276292750755:android:e99123f734af0faa' && device.os == 'android'",
                "tagColor": "GREEN"
            }
        ];
        const parameters = {
            applicationName: buildParameter('MyWell', 'the application name', conditionKeys, ['GGMN', 'GGMN DEV', 'MyWell']),
            baseApiType: buildParameter('MyWellApi', '', conditionKeys, ['GGMNApi', 'GGMNApi', 'MyWellApi']),
            firebaseBaseUrl: buildParameter('https://us-central1-our-water.cloudfunctions.net', '', conditionKeys, ['GGMN', 'GGMN', 'https://us-central1-our-water.cloudfunctions.net']),
            ggmnBaseUrl: buildParameter('https://ggmn.lizard.net', '', conditionKeys, ['https://ggmn.lizard.net', 'https://ggmn.lizard.net', '']),
            showConnectToButton: buildParameter('false', 'should should the connect to button?', conditionKeys, ['true', 'true', 'false']),
            showSyncButton: buildParameter('false', 'should should the sync to button?', conditionKeys, ['true', 'true', 'false']),
            showPendingButton: buildParameter('true', 'should should the pending button?', conditionKeys, ['false', 'false', 'true']),
            mywellBaseUrl: buildParameter('https://mywell-server.vessels.tech', '', conditionKeys, ['', '', 'https://mywell-server.vessels.tech']),
            map_shouldLoadAllResources: buildParameter(true, '', conditionKeys, [false, false, true]),
            newReading_enableImageUpload: buildParameter(true, 'the application name', conditionKeys, [false, false, true]),
            homeScreen: buildParameter('Simple', 'the home screen style. Simple or Map', conditionKeys, ['Map', 'Map', 'Simple']),
            resourceDetail_showSubtitle: buildParameter(true, 'Should the resrouce detail section have a subtitle?', conditionKeys, [true, true, false]),
            resourceDetail_allowEditing: buildParameter(false, 'Are users allowed to edit resources?', conditionKeys, [true, true, false]),
            resourceDetail_allowDelete: buildParameter(false, 'Are users allowed to delete resources?', conditionKeys, [true, true, false]),
            resourceDetail_editReadings: buildParameter(false, 'Are users allowed to edit readings?', conditionKeys, [true, true, false]),
            favouriteResourceList_showGetStartedButtons: buildParameter(true, 'Should the favourite resource list have a get started hint if empty?', conditionKeys, [false, false, true]),
            editResource_hasResourceName: buildParameter(false, 'When creating a new resource, can the user edit the name?', conditionKeys, [true, true, false]),
            editResource_showOwerName: buildParameter(true, 'When creating a new resource, can the user set the owner name?', conditionKeys, [false, false, true]),
            editResource_availableTypes: buildParameter(['well', 'raingauge', 'quality', 'checkdam'], 'When creating a new resource, what types of resource can be created?', conditionKeys, [
                ['well'],
                ['well'],
                ['well', 'raingauge', 'quality', 'checkdam'],
            ]),
            editResource_defaultTypes: buildParameter({
                well: [{ name: 'default', parameter: 'gwmbgs', readings: [] }],
                raingauge: [{ name: 'default', parameter: 'gwmbgs', readings: [] }],
                quality: [
                    { name: 'salinity', parameter: 'salinity', readings: [] },
                    { name: 'ph', parameter: 'ph', readings: [] },
                    { name: 'nitrogen', parameter: 'nitrogen', readings: [] },
                ],
                checkdam: [{ name: 'default', parameter: 'gwmbgs', readings: [] }],
            }, 'The default resource timeseries types', conditionKeys, [
                //GGMN
                {
                    well: [
                        { name: 'GWmMSL', parameter: 'GWmMSL', readings: [], unitOfMeasure: 'm' },
                        { name: 'GWmBGS', parameter: 'GWmBGS', readings: [], unitOfMeasure: 'm' },
                    ]
                },
                //GGMN
                {
                    well: [
                        { name: 'GWmMSL', parameter: 'GWmMSL', readings: [], unitOfMeasure: 'm' },
                        { name: 'GWmBGS', parameter: 'GWmBGS', readings: [], unitOfMeasure: 'm' },
                    ]
                },
                //MyWell
                {
                    //TODO: I'm not sure what the parameter should be - default?
                    well: [{ name: 'default', parameter: 'default', readings: [], unitOfMeasure: 'm' }],
                    raingauge: [{ name: 'default', parameter: 'default', readings: [], unitOfMeasure: 'mm' }],
                    quality: [
                        { name: 'salinity', parameter: 'salinity', readings: [], unitOfMeasure: 'ppm' },
                        { name: 'ph', parameter: 'ph', readings: [], unitOfMeasure: 'ppm' },
                        { name: 'nitrogen', parameter: 'nitrogen', readings: [], unitOfMeasure: 'ppm' },
                    ],
                    checkdam: [{ name: 'default', parameter: 'default', readings: [], unitOfMeasure: 'm' }],
                }
            ]),
            editResource_allowCustomId: buildParameter(false, 'When creating a resource, is the user allowed to enter a custom id?', conditionKeys, [true, true, false]),
            editResource_hasWaterColumnHeight: buildParameter(false, "When creating/editing a resource, should the user specify water column height?", conditionKeys, [true, false]),
            favouriteResource_scrollDirection: buildParameter('Vertical', 'What direction does the favourite resource section scroll in?', conditionKeys, ['Horizontal', 'Horizontal', 'Vertical']),
            usesShortId: buildParameter(true, 'the application name', conditionKeys, ['GGMN', 'GGMN', 'MyWell']),
            allowsUserRegistration: buildParameter(true, 'Should we allow users to sign up?', conditionKeys, [false, false, true]),
            translationOptions: buildParameter(mywellTranslationOptionsJSON, 'The translation options', conditionKeys, [
                ggmnTranslationsOptionsJSON,
                ggmnTranslationsOptionsJSON,
                mywellTranslationOptionsJSON,
            ]),
            translations: buildParameter(mywellTranslationsJSON, 'The translations', conditionKeys, [
                ggmnTranslationsJSON,
                ggmnTranslationsJSON,
                mywellTranslationsJSON,
            ]),
            ggmn_ignoreReading: buildParameter(JSON.stringify({ date: "2017-01-01T01:11:01Z", value: 0 }, null, 2), 'A reading in GGMN that should be ignored by the graphs', conditionKeys, [
                JSON.stringify({ date: "2017-01-01T01:11:01Z", value: 0 }, null, 2),
                JSON.stringify({ date: "2017-01-01T01:11:01Z", value: 0 }, null, 2),
                JSON.stringify({ date: "2017-01-01T01:11:01Z", value: 0 }, null, 2),
            ]),
            map_regionChangeReloadDebounceTimeMs: buildParameter('1000', 'MS wait time after user has dragged map, but before reloading resources', conditionKeys, [
                '500',
                '500',
                '1000',
            ]),
            showMapInSidebar: buildParameter(true, 'Should we display the map in the sidebar?', conditionKeys, [false, false, true]),
            resourceDetail_shouldShowTable: buildParameter(true, 'Show the readings table?', conditionKeys, [false, false, true]),
        };
        return Promise.resolve({
            conditions,
            parameters,
        });
    });
}
exports.getNewConfig = getNewConfig;
//# sourceMappingURL=index.js.map