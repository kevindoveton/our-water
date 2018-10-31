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
const Types_1 = require("../../fn_sos/Types");
const AppProviderTypes_1 = require("../types/AppProviderTypes");
const FirebaseApi_1 = require("./FirebaseApi");
const FOI_1 = require("../models/SOS/FOI");
const GetFeatureOfInterestResponse_1 = require("../models/SOS/GetFeatureOfInterestResponse");
/**
 *
 * TODO: use these to format your responses in xml:
 *  https://github.com/highsource/jsonix
 *
 */
class SOSApi {
    /**
     * @name handleRequest
     * @description Handle the basic request
     */
    static handleRequest(request) {
        switch (request.type) {
            case Types_1.SOSRequestType.GetCapabilities: return this.getCapabilities(request);
            case Types_1.SOSRequestType.DescribeSensor: return this.describeSensor(request);
            case Types_1.SOSRequestType.GetObservation: return this.getObservation(request);
            case Types_1.SOSRequestType.GetFeatureOfInterest: return this.getFeatureOfInterest(request);
            default: {
                const _exhaustiveMatch = request;
                throw new Error(`Non-exhausive match for path: ${_exhaustiveMatch}`);
            }
        }
    }
    //
    // Core API
    //---------------------------------
    /**
     * @name GetCapabilities
     *
     * Provides access to metadata and detailed information about the operations
     * available by an SOS server.
     *
     * eg: http://schemas.opengis.net/sos/2.0/examples/core/GetCapabilities1_response.xml
     */
    static getCapabilities(request) {
        return Promise.resolve(null);
    }
    /**
     * @name DescribeSensor
     *
     * @summary Enables querying of metadata about the sensors and sensor systems available by an SOS server.
     *
     * @example
     * eg: http://schemas.opengis.net/sos/2.0/examples/core/DescribeSensor1.xml
     *
     *
     * Thoughts
     */
    static describeSensor(request) {
        return Promise.resolve(null);
    }
    /**
     * @name GetObservation
     *
     * @summary Provides access to observations by allowing spatial, temporal and thematic filtering.
     *
     * @example
     * - http://schemas.opengis.net/sos/2.0/examples/core/GetObservation1_obsProps.xml
     * - http://schemas.opengis.net/sos/2.0/examples/core/GetObservation2_obsProps_Procedure.xml
     *
     *
     * Params?
     *  - offering
     *  - featureOfInterest
     *  - observedProperty
     *  - phenomenon
     */
    static getObservation(request) {
        return Promise.resolve(null);
    }
    //
    // Enhanced Operations Extension API
    //---------------------------------
    /**
     * @name GetObservationByID
     *
     * @summary Provides access to observations from an SOS by passing only the ID of an observation.
     *
     *
     */
    static getObservationById() {
        throw new Error("getObservationById Not Implemented");
    }
    /**
     * GetFeatureOfInterest
     *
     * provides direct access to the features of interest for which the
     * SOS offers observations.
     *
     * I think this is the endpoint used to serve multiple wells at a time.
     * Looks like there is no pagination or rate liming on this endpoint.
     *
     * We will need to include some metadata to make sure these end up in the correct
     * organizations
     *
     *
    * <sams:SF_SpatialSamplingFeature gml:id="ab.mon.654"> becomes the Id of the gw station
     *
     */
    //eg: http://gin.gw-info.net/GinService/sos/gw?REQUEST=GetFeatureOfInterest&VERSION=2.0.0&SERVICE=SOS&spatialFilter=om:featureOfInterest/*/sams: shape,-116, 50.5, -75, 1.6, http://www.opengis.net/def/crs/EPSG/0/4326&namespaces=xmlns(sams,http://www.opengis.net/samplingSpatial/2.0),xmlns(om,http://www.opengis.net/om/2.0)
    static getFeatureOfInterest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            /* Make the Firebase Api call */
            //TODO: we may need to edit this zoom value
            let result;
            if (request.filter.type === Types_1.FilterType.noFilter) {
                //TODO: implement FirebaseAp call for all resources
                // return the latest 100 only.
                result = { type: AppProviderTypes_1.ResultType.ERROR, message: 'TODO: implement no filter resources' };
            }
            else {
                result = yield FirebaseApi_1.default.resourcesNearLocation(request.orgId, request.filter.lat, request.filter.lng, request.filter.zoom);
            }
            if (result.type === AppProviderTypes_1.ResultType.ERROR) {
                return result;
            }
            /* Convert from firebase Query to SOS Objects */
            const fois = result.result.map(r => FOI_1.default.fromResource(r));
            /* Serialize SOS Objects*/
            const foiResponse = {
                //TODO: not sure about this id
                id: '12345',
                fois,
                exceptionReport: 'exceptionreport?',
            };
            const response = new GetFeatureOfInterestResponse_1.default(foiResponse);
            const responseString = response.serialize();
            //build the response
            const res = { type: AppProviderTypes_1.ResultType.SUCCESS, result: responseString };
            return res;
        });
    }
}
exports.default = SOSApi;
//# sourceMappingURL=SOSApi.js.map