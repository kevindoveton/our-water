"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FirebaseAdmin_1 = require("./FirebaseAdmin");
const firestore = FirebaseAdmin_1.default.firestore();
const settings = { /* your settings... */ timestampsInSnapshots: true };
firestore.settings(settings);
exports.default = firestore;
//# sourceMappingURL=Firestore.js.map