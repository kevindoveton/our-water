"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
//TODO: move these back to utils, for some reason TS doesn't like them being here.
function getBoolean(value) {
    switch (value) {
        case true:
        case "true":
        case 1:
        case "1":
        case "on":
        case "yes":
            return true;
        default:
            return false;
    }
}
function asList(value) {
    return value.split(',');
}
const envConfig = functions.config();
exports.mywellLegacyAccessToken = envConfig.config.mywell_legacy_access_token;
exports.outboundEmailAddress = envConfig.config.outbound_email_address;
exports.outboundEmailPassword = envConfig.config.outbound_email_password;
exports.shouldSendEmails = getBoolean(envConfig.config.should_send_emails);
exports.testEmailWhitelist = asList(envConfig.config.test_email_whitelist);
//# sourceMappingURL=env.js.map