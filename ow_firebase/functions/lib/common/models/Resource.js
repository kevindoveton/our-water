"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FirestoreDoc_1 = require("./FirestoreDoc");
class Resource extends FirestoreDoc_1.default {
    constructor(orgId, externalIds, coords, resourceType, owner) {
        super();
        this.docName = 'resource';
        this.orgId = orgId;
        this.externalIds = externalIds;
        this.coords = coords;
        this.resourceType = resourceType;
        this.owner = owner;
    }
    serialize() {
        return {
            id: this.id,
            orgId: this.orgId,
            externalIds: this.externalIds.serialize(),
            coords: this.coords,
            resourceType: this.resourceType,
            //TODO: this may cause trouble
            owner: this.owner,
            lastValue: this.lastValue,
            lastReadingDatetime: this.lastReadingDatetime,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
exports.Resource = Resource;
//# sourceMappingURL=Resource.js.map