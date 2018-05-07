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
const DatasourceType_1 = require("../enums/DatasourceType");
const request = require("request-promise-native");
const Group_1 = require("./Group");
const firestore_1 = require("@google-cloud/firestore");
const utils_1 = require("../utils");
const GroupType_1 = require("../enums/GroupType");
const Resource_1 = require("./Resource");
const ResourceIdType_1 = require("../types/ResourceIdType");
const ResourceType_1 = require("../enums/ResourceType");
class LegacyMyWellDatasource {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.type = DatasourceType_1.DatasourceType.LegacyMyWellDatasource;
    }
    /**
     * Iterates through pincodes and villages from MyWell datasource
     *
     * As villages have only a single point, we create our own
     * imaginary bounding box for the new group
     *
     */
    getGroupData(orgId, fs) {
        // https://mywell-server.vessels.tech/api/villages
        const uriVillage = `${this.baseUrl}/api/villages`;
        const options = {
            method: 'GET',
            uri: uriVillage,
            json: true,
        };
        return request(options)
            .then((villages) => {
            //TODO: save using bulk method
            const newGroups = villages.map(village => {
                const coords = utils_1.createDiamondFromLatLng(village.coordinates.lat, village.coordinates.lat, 0.1);
                return new Group_1.Group(village.name, orgId, GroupType_1.GroupType.Village, coords);
            });
            const errors = [];
            const savedGroups = [];
            newGroups.forEach(group => {
                return group.create({ fs })
                    .then(savedGroup => {
                    savedGroups.push(savedGroup);
                })
                    .catch(err => {
                    console.log('error saving new group', err);
                    errors.push(err);
                });
            });
            //TODO: return errors as well
            return savedGroups;
        });
        //TODO: get pincodes by inferring from above villages. Draw coords from centre of each village
    }
    /**
     * Create groups based on inferred pincode data
     *
     */
    getPincodeData(orgId, fs) {
        //Get all villages, and for each village within a pincode, create a bounding box based on the center
        const uriVillage = `${this.baseUrl}/api/villages`;
        const options = {
            method: 'GET',
            uri: uriVillage,
            json: true,
        };
        let pincodeGroups = null;
        const pincodeIds = {};
        return request(options)
            .then((villages) => {
            //group the villages by id
            villages.forEach(v => {
                const groupList = pincodeIds[v.postcode] || [];
                groupList.append(v);
                pincodeIds[v.postcode] = groupList;
            });
            //Now go through each pincode group, and create a single group
            pincodeGroups = Object.keys(pincodeIds).map(pincode => {
                const villages = pincodeIds[pincode];
                //TODO: the only issue with this approach is that the coordinates aren't in order.
                const coords = villages.map(v => new firestore_1.GeoPoint(v.coordinates.lat, v.coordinates.lng));
                return new Group_1.Group(pincode, orgId, GroupType_1.GroupType.Pincode, coords);
            });
            let errors = [];
            let savedGroups = [];
            pincodeGroups.forEach(group => {
                return group.create({ fs })
                    .then(savedGroup => savedGroups.push(savedGroup))
                    .catch(err => errors.push(err));
            });
            return pincodeGroups;
        });
    }
    /**
     * get all resources from MyWell
     *
     * This doesn't require pagination, so we won't bother implementing it yet.
     * convert legacy MyWell resources into OW resources
     * return
     */
    getResourcesData(orgId, fs) {
        const uriResources = `${this.baseUrl}/api/resources`;
        const options = {
            method: 'GET',
            uri: uriResources,
            json: true,
        };
        let resources = null;
        return request(options)
            .then((legacyRes) => {
            legacyRes.forEach(r => {
                const externalIds = ResourceIdType_1.default.fromLegacyMyWellId(r.postcode, r.id);
                const coords = new firestore_1.GeoPoint(r.geo.lat, r.geo.lng);
                const resourceType = ResourceType_1.resourceTypeFromString(r.type);
                const owner = { name: r.owner, createdByUserId: 'default' };
                const newResource = new Resource_1.Resource(orgId, externalIds, coords, resourceType, owner);
                resources.push(newResource);
            });
            let errors = [];
            let savedResources = [];
            resources.forEach(res => {
                return res.create({ fs })
                    .then(savedRes => savedResources.push(savedRes))
                    .catch(err => errors.push(err));
            });
            return savedResources;
        });
        //TODO: define new group relationships somehow (this will be tricky - I've had too much wine)
    }
    /**
     * Get all readings from MyWell
     *
     * This also doesn't require pagination, but is expensive.
     * Perhaps we should test with just a small number of readings for now
     *
     */
    getReadingsData(orgId, fs) {
        const uriReadings = `${this.baseUrl}/api/resources`; //TODO: add filter
        const options = {
            method: 'GET',
            uri: uriReadings,
            json: true,
        };
        let readings = null;
        return request(options)
            .then((legacyReadings) => {
            legacyReadings.forEach(r => {
                //TODO: convert legacy reading to new reading
                // const externalIds: ResourceIdType = ResourceIdType.fromLegacyMyWellId(r.postcode, r.id);
                // const coords = new GeoPoint(r.geo.lat, r.geo.lng);
                // const resourceType = resourceTypeFromString(r.type);
                // const owner: ResourceOwnerType = { name: r.owner, createdByUserId: 'default' };
                // const newResource: Resource = new Resource(orgId, externalIds, coords, resourceType, owner);
                //TODO: we need to get the new readings to point to the new resourceIds
                readings.push(newReading);
            });
            let errors = [];
            let savedReadings = [];
            readings.forEach(res => {
                return res.create({ fs })
                    .then(savedRes => savedReadings.push(savedRes))
                    .catch(err => errors.push(err));
            });
            return savedReadings;
        });
    }
    pullDataFromDataSource(orgId, fs) {
        return __awaiter(this, void 0, void 0, function* () {
            const villageGroups = yield this.getGroupData(orgId, fs);
            const pincodeGroups = yield this.getPincodeData(orgId, fs);
            const resources = yield this.getResourcesData(orgId, fs);
            const readings = yield this.getReadingsData(orgId, fs);
            return {
                groups: villageGroups + pincodeGroups,
                resources,
                readings
            };
        });
    }
    pushDataToDataSource() {
        console.log("Implementation not required. MyWell Data source is readonly for now.");
        return true;
    }
    serialize() {
        return {
            baseUrl: this.baseUrl,
            type: this.type.toString(),
        };
    }
}
exports.default = LegacyMyWellDatasource;
//# sourceMappingURL=LegacyMyWellDatasource.js.map