"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate = require("express-validation");
const express = require("express");
const FirebaseAdmin_1 = require("../../common/apis/FirebaseAdmin");
const utils_1 = require("../../common/utils");
const bodyParser = require('body-parser');
const Joi = require('joi');
module.exports = (functions) => {
    const app = express();
    app.use(bodyParser.json());
    utils_1.enableLogging(app);
    app.get('/', (req, res) => {
        console.log("TODO");
        res.json(['test_12345', 'mywell', 'igrac']);
    });
    const createOrgValidation = {
        options: {
            allowUnknownBody: false,
        },
        body: {
            name: Joi.string().required(),
            url: Joi.string().hostname(),
        }
    };
    app.post('/', validate(createOrgValidation), (req, res) => {
        return FirebaseAdmin_1.firestore.collection('org').add(req.body)
            .then(result => {
            return res.json({ orgId: result.id });
        });
    });
    return functions.https.onRequest(app);
};
//# sourceMappingURL=org.js.map