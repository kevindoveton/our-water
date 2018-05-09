"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate = require("express-validation");
const express = require("express");
const cors = require("cors");
const moment = require("moment");
const bodyParser = require('body-parser');
const Joi = require('joi');
const fb = require('firebase-admin');
const SyncMethod_1 = require("../common/enums/SyncMethod");
const Sync_1 = require("../common/models/Sync");
const SyncRun_1 = require("../common/models/SyncRun");
const LegacyMyWellDatasource_1 = require("../common/models/Datasources/LegacyMyWellDatasource");
const DatasourceType_1 = require("../common/enums/DatasourceType");
const FileDatasource_1 = require("../common/models/Datasources/FileDatasource");
const FileDatasourceOptions_1 = require("../common/models/FileDatasourceOptions");
module.exports = (functions, admin) => {
    const app = express();
    app.use(bodyParser.json());
    const fs = admin.firestore();
    /* CORS Configuration */
    const openCors = cors({ origin: '*' });
    app.use(openCors);
    app.use(function (err, req, res, next) {
        console.log("error", err);
        if (err.status) {
            return res.status(err.status).json(err);
        }
        return res.status(500).json({ status: 500, message: err.message });
    });
    /**
     * createSync
     *
     * Creates a new sync with the given settings
     */
    const createSyncValidation = {
        options: {
            allowUnknownBody: false,
        },
        body: {
            data: {
                isOneTime: Joi.boolean().required(),
                datasource: Joi.object().keys({
                    //TODO: add more to this later
                    type: Joi.string().required(),
                    //TODO: legacy options only
                    url: Joi.string(),
                    //TODO: file options:
                    fileUrl: Joi.string(),
                    dataType: Joi.string(),
                    fileFormat: Joi.string(),
                    options: Joi.object(),
                }).required(),
                type: Joi.string().required(),
                selectedDatatypes: Joi.array().items(Joi.string()).required()
            }
        }
    };
    const initDatasourceWithOptions = (datasource) => {
        console.log("datasource", datasource.type);
        switch (datasource.type) {
            case DatasourceType_1.DatasourceType.LegacyMyWellDatasource:
                return new LegacyMyWellDatasource_1.default(datasource.url);
            case DatasourceType_1.DatasourceType.FileDatasource:
                const { fileUrl, dataType, fileFormat, options } = datasource;
                return new FileDatasource_1.FileDatasource(fileUrl, dataType, fileFormat, FileDatasourceOptions_1.default.deserialize(options));
            default:
                throw new Error(`Tried to initialize Datasource of unknown type: ${datasource.type}`);
        }
    };
    app.post('/:orgId', validate(createSyncValidation), (req, res, next) => {
        const { orgId } = req.params;
        const { isOneTime, datasource, type, selectedDatatypes } = req.body.data;
        const ds = initDatasourceWithOptions(datasource);
        const sync = new Sync_1.Sync(isOneTime, ds, orgId, [SyncMethod_1.SyncMethod.validate], selectedDatatypes);
        return sync.create({ fs })
            .then((createdSync) => {
            return res.json({ data: { syncId: createdSync.id } });
        })
            .catch(err => {
            console.log(err);
            next(err);
        });
    });
    /**
     * runSync(orgId, syncId)
     *
     * runs the sync of the given id.
     * Syncs each have a number of methods:
     * - validate
     * - pushTo
     * - pullFrom
     *
     * later on
     * - get (returns the given data for the sync)
     * - post (updates the given data for ths sync)
     *
     * //TODO: auth - make admin only
     */
    const runSyncValidation = {
        query: {
            method: SyncMethod_1.SyncMethodValidation.required()
        }
    };
    //TODO: this should probably be get, but httpsCallable seems to only want to do POST
    //refer to this: https://github.com/firebase/firebase-js-sdk/blob/d59b72493fc89ff89c8a17bf142f58517de4c566/packages/functions/src/api/service.ts
    app.post('/:orgId/run/:syncId', validate(runSyncValidation), (req, res, next) => {
        const { orgId, syncId } = req.params;
        const { method } = req.query;
        return Sync_1.Sync.getSync({ orgId, id: syncId, fs })
            .then((sync) => {
            if (sync.isOneTime && moment(sync.lastSyncDate).unix() !== 0) {
                throw new Error(`Cannot run sync twice. Sync is marked as one time only`);
            }
            //TODO: put in proper email addresses
            const run = new SyncRun_1.SyncRun(orgId, syncId, method, ['lewis@vesselstech.com']);
            return run.create({ fs });
        })
            .then((run) => {
            //TODO:when the sync run finishes, set the sync.lastSyncDate
            //run the sync, and return the id of the run.
            //We don't return the result of this promise. User can look up the results later on
            run.run({ fs })
                .catch(err => console.error(`Error running syncRun of id ${run.id}. Message: ${err.message}`));
            return res.json({ data: { syncRunId: run.id } });
        })
            .catch(err => {
            console.log('error in runSync:', err);
            next(err);
        });
    });
    return functions.https.onRequest(app);
};
//# sourceMappingURL=sync.js.map