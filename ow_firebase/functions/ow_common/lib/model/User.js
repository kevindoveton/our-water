"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DefaultUser = void 0;

var _ow_translations = require("ow_translations");

var _UserStatus = _interopRequireDefault(require("../enums/UserStatus"));

var _UserType = _interopRequireDefault(require("../enums/UserType"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DefaultUser = {
  id: 'no_user_id',
  favouriteResources: {},
  newResources: {},
  pendingSavedReadings: [],
  pendingSavedResources: [],
  recentResources: [],
  recentSearches: [],
  status: _UserStatus.default.Unapproved,
  translation: _ow_translations.TranslationEnum.en_AU,
  type: _UserType.default.User
};
exports.DefaultUser = DefaultUser;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9Vc2VyLnRzIl0sIm5hbWVzIjpbIkRlZmF1bHRVc2VyIiwiaWQiLCJmYXZvdXJpdGVSZXNvdXJjZXMiLCJuZXdSZXNvdXJjZXMiLCJwZW5kaW5nU2F2ZWRSZWFkaW5ncyIsInBlbmRpbmdTYXZlZFJlc291cmNlcyIsInJlY2VudFJlc291cmNlcyIsInJlY2VudFNlYXJjaGVzIiwic3RhdHVzIiwiVXNlclN0YXR1cyIsIlVuYXBwcm92ZWQiLCJ0cmFuc2xhdGlvbiIsIlRyYW5zbGF0aW9uRW51bSIsImVuX0FVIiwidHlwZSIsIlVzZXJUeXBlIiwiVXNlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBOztBQUVBOztBQUNBOzs7O0FBbUJPLElBQU1BLFdBQWlCLEdBQUc7QUFDL0JDLEVBQUFBLEVBQUUsRUFBRSxZQUQyQjtBQUUvQkMsRUFBQUEsa0JBQWtCLEVBQUUsRUFGVztBQUcvQkMsRUFBQUEsWUFBWSxFQUFFLEVBSGlCO0FBSS9CQyxFQUFBQSxvQkFBb0IsRUFBRSxFQUpTO0FBSy9CQyxFQUFBQSxxQkFBcUIsRUFBRSxFQUxRO0FBTS9CQyxFQUFBQSxlQUFlLEVBQUUsRUFOYztBQU8vQkMsRUFBQUEsY0FBYyxFQUFFLEVBUGU7QUFRL0JDLEVBQUFBLE1BQU0sRUFBRUMsb0JBQVdDLFVBUlk7QUFTL0JDLEVBQUFBLFdBQVcsRUFBRUMsaUNBQWdCQyxLQVRFO0FBVS9CQyxFQUFBQSxJQUFJLEVBQUVDLGtCQUFTQztBQVZnQixDQUExQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlc291cmNlLCBQZW5kaW5nUmVzb3VyY2UgfSBmcm9tICcuL1Jlc291cmNlJztcbmltcG9ydCB7IFBlbmRpbmdSZWFkaW5nIH0gZnJvbSAnLi9SZWFkaW5nJztcbmltcG9ydCB7IFRyYW5zbGF0aW9uRW51bSB9IGZyb20gJ293X3RyYW5zbGF0aW9ucyc7XG5pbXBvcnQgeyBEaWN0VHlwZSB9IGZyb20gJy4uL3V0aWxzL0RpY3RUeXBlJztcbmltcG9ydCBVc2VyU3RhdHVzIGZyb20gJy4uL2VudW1zL1VzZXJTdGF0dXMnO1xuaW1wb3J0IFVzZXJUeXBlIGZyb20gJy4uL2VudW1zL1VzZXJUeXBlJztcblxuZXhwb3J0IHR5cGUgVXNlciA9IHtcbiAgaWQ6IHN0cmluZztcbiAgZmF2b3VyaXRlUmVzb3VyY2VzOiBEaWN0VHlwZTxSZXNvdXJjZT47XG4gIG5ld1Jlc291cmNlczogRGljdFR5cGU8c3RyaW5nPjsgLy9BIGxpc3Qgb2YgbmV3IHJlc291cmNlcyB0aGUgdXNlciBoYXNuJ3Qgc2VlbiB5ZXQuXG4gIHBlbmRpbmdTYXZlZFJlYWRpbmdzOiBQZW5kaW5nUmVhZGluZ1tdO1xuICBwZW5kaW5nU2F2ZWRSZXNvdXJjZXM6IFBlbmRpbmdSZXNvdXJjZVtdO1xuICByZWNlbnRSZXNvdXJjZXM6IFJlc291cmNlW107XG4gIHJlY2VudFNlYXJjaGVzOiBzdHJpbmdbXTtcbiAgc3RhdHVzOiBVc2VyU3RhdHVzO1xuICB0cmFuc2xhdGlvbjogVHJhbnNsYXRpb25FbnVtO1xuICB0eXBlOiBVc2VyVHlwZTtcbiAgbmFtZT86IHN0cmluZztcbiAgbW9iaWxlPzogc3RyaW5nO1xuICBlbWFpbD86IHN0cmluZztcbiAgbmlja25hbWU/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgY29uc3QgRGVmYXVsdFVzZXI6IFVzZXIgPSB7XG4gIGlkOiAnbm9fdXNlcl9pZCcsXG4gIGZhdm91cml0ZVJlc291cmNlczoge30sXG4gIG5ld1Jlc291cmNlczoge30sXG4gIHBlbmRpbmdTYXZlZFJlYWRpbmdzOiBbXSxcbiAgcGVuZGluZ1NhdmVkUmVzb3VyY2VzOiBbXSxcbiAgcmVjZW50UmVzb3VyY2VzOiBbXSxcbiAgcmVjZW50U2VhcmNoZXM6IFtdLFxuICBzdGF0dXM6IFVzZXJTdGF0dXMuVW5hcHByb3ZlZCxcbiAgdHJhbnNsYXRpb246IFRyYW5zbGF0aW9uRW51bS5lbl9BVSxcbiAgdHlwZTogVXNlclR5cGUuVXNlclxufTtcbiJdfQ==