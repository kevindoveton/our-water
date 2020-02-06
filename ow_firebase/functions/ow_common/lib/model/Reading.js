"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DefaultReading = exports.ReadingType = void 0;

var _ResourceStationType = _interopRequireDefault(require("../enums/ResourceStationType"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ReadingType;
exports.ReadingType = ReadingType;

(function (ReadingType) {
  ReadingType["Any"] = "Any";
  ReadingType["MyWell"] = "MyWell";
  ReadingType["GGMN"] = "GGMN";
})(ReadingType || (exports.ReadingType = ReadingType = {}));

/**
 * Default Types
 */
var DefaultReading = {
  type: ReadingType.Any,
  datetime: "2017-01-01T01:11:01Z",
  resourceId: "no_resource_id",
  resourceType: _ResourceStationType.default.well,
  timeseriesId: "no_timeseries_id",
  value: 0
};
exports.DefaultReading = DefaultReading;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9SZWFkaW5nLnRzIl0sIm5hbWVzIjpbIlJlYWRpbmdUeXBlIiwiRGVmYXVsdFJlYWRpbmciLCJ0eXBlIiwiQW55IiwiZGF0ZXRpbWUiLCJyZXNvdXJjZUlkIiwicmVzb3VyY2VUeXBlIiwiUmVzb3VyY2VTdGF0aW9uVHlwZSIsIndlbGwiLCJ0aW1lc2VyaWVzSWQiLCJ2YWx1ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBOzs7O0lBRVlBLFc7OztXQUFBQSxXO0FBQUFBLEVBQUFBLFc7QUFBQUEsRUFBQUEsVztBQUFBQSxFQUFBQSxXO0dBQUFBLFcsMkJBQUFBLFc7O0FBNkRaOzs7QUFJTyxJQUFNQyxjQUF1QixHQUFHO0FBQ3JDQyxFQUFBQSxJQUFJLEVBQUVGLFdBQVcsQ0FBQ0csR0FEbUI7QUFFckNDLEVBQUFBLFFBQVEsRUFBRSxzQkFGMkI7QUFHckNDLEVBQUFBLFVBQVUsRUFBRSxnQkFIeUI7QUFJckNDLEVBQUFBLFlBQVksRUFBRUMsNkJBQW9CQyxJQUpHO0FBS3JDQyxFQUFBQSxZQUFZLEVBQUUsa0JBTHVCO0FBTXJDQyxFQUFBQSxLQUFLLEVBQUU7QUFOOEIsQ0FBaEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNeVdlbGxFeHRlcm5hbElkcyB9IGZyb20gXCIuL0V4dGVybmFsSWRzXCI7XG5pbXBvcnQgeyBNYXliZSB9IGZyb20gXCIuLi91dGlscy9NYXliZVwiO1xuaW1wb3J0IFJlc291cmNlU3RhdGlvblR5cGUgZnJvbSBcIi4uL2VudW1zL1Jlc291cmNlU3RhdGlvblR5cGVcIjtcblxuZXhwb3J0IGVudW0gUmVhZGluZ1R5cGUge1xuICBBbnkgPSAnQW55JyxcbiAgTXlXZWxsID0gJ015V2VsbCcsXG4gIEdHTU4gPSAnR0dNTicsXG59XG5cbmV4cG9ydCB0eXBlIFJlYWRpbmcgPSAgQmFzZVJlYWRpbmcgfCBNeVdlbGxSZWFkaW5nIHwgR0dNTlJlYWRpbmc7XG5leHBvcnQgdHlwZSBCYXNlUmVhZGluZyA9IHtcbiAgdHlwZTogUmVhZGluZ1R5cGU7XG5cbiAgZGF0ZXRpbWU6IHN0cmluZzsgLy9pc28gZm9ybWF0dGVkIHN0cmluZ1xuICByZXNvdXJjZUlkOiBzdHJpbmc7XG4gIHJlc291cmNlVHlwZTogUmVzb3VyY2VTdGF0aW9uVHlwZVxuICB0aW1lc2VyaWVzSWQ6IHN0cmluZyxcbiAgdmFsdWU6IG51bWJlcjtcbn07XG5cbnR5cGUgTXlXZWxsUmVhZGluZ1Byb3BzID0ge1xuICB0eXBlOiBSZWFkaW5nVHlwZS5NeVdlbGw7XG4gIGlzTGVnYWN5OiBib29sZWFuLFxuICBleHRlcm5hbElkczogTXlXZWxsRXh0ZXJuYWxJZHMsXG4gIGltYWdlOiBNYXliZTx7IGJhc2U2NEltYWdlOiBzdHJpbmcgfT4sXG4gIGxvY2F0aW9uOiBNYXliZTx7XG4gICAgbGF0aXR1ZGU6IG51bWJlcixcbiAgICBsb25naXR1ZGU6IG51bWJlcixcbiAgfT4sXG59XG5cbnR5cGUgR0dNTlJlYWRpbmdQcm9wcyA9IHtcbiAgdHlwZTogUmVhZGluZ1R5cGUuR0dNTixcbiAgcmVzb3VyY2VUeXBlOiBSZXNvdXJjZVN0YXRpb25UeXBlLndlbGwsXG59XG5cbmV4cG9ydCB0eXBlIE15V2VsbFJlYWRpbmcgPSBCYXNlUmVhZGluZyAmIE15V2VsbFJlYWRpbmdQcm9wcztcbmV4cG9ydCB0eXBlIEdHTU5SZWFkaW5nID0gQmFzZVJlYWRpbmcgJiBHR01OUmVhZGluZ1Byb3BzO1xuXG5cbi8qKlxuICogUGVuZGluZyBUeXBlc1xuICogXG4gKiBSZXByZXNlbnRzIGFuIGluY29tcGxldGUgb3IgcGVuZGluZyB2ZXJzaW9uIG9mIFJlYWRpbmdcbiAqL1xuZXhwb3J0IHR5cGUgUGVuZGluZ1JlYWRpbmcgPSBCYXNlUGVuZGluZ1JlYWRpbmcgfCBQZW5kaW5nTXlXZWxsUmVhZGluZyB8IFBlbmRpbmdHR01OUmVhZGluZztcblxuZXhwb3J0IHR5cGUgQmFzZVBlbmRpbmdSZWFkaW5nID0ge1xuICBwZW5kaW5nOiB0cnVlLFxuXG4gIGRhdGV0aW1lOiBzdHJpbmc7IC8vaXNvIGZvcm1hdHRlZCBzdHJpbmdcbiAgcmVzb3VyY2VJZDogTWF5YmU8c3RyaW5nPjtcbiAgcmVzb3VyY2VUeXBlOiBSZXNvdXJjZVN0YXRpb25UeXBlLFxuICB0aW1lc2VyaWVzSWQ6IE1heWJlPHN0cmluZz4sXG4gIHZhbHVlOiBudW1iZXI7XG59XG5cbi8vVE9ETzogdGhpcyBkb2Vzbid0IGdlbmVyYWxpemUgd2VsbCAtIGl0IGRvZXNuJ3QgYWxsb3cgZm9yIG1pc3NpbmcgdmFsdWVzIHByb3Blcmx5IGluIHRoZVxuLy9NeVdlbGwgYW5kIEdHTU4gcmVhZGluZyBwcm9wc1xuZXhwb3J0IHR5cGUgUGVuZGluZ015V2VsbFJlYWRpbmcgPSBCYXNlUGVuZGluZ1JlYWRpbmcgJiBNeVdlbGxSZWFkaW5nUHJvcHM7XG5leHBvcnQgdHlwZSBQZW5kaW5nR0dNTlJlYWRpbmcgPSBCYXNlUGVuZGluZ1JlYWRpbmcgJiBHR01OUmVhZGluZ1Byb3BzO1xuXG5cblxuLyoqXG4gKiBEZWZhdWx0IFR5cGVzXG4gKi9cblxuZXhwb3J0IGNvbnN0IERlZmF1bHRSZWFkaW5nOiBSZWFkaW5nID0ge1xuICB0eXBlOiBSZWFkaW5nVHlwZS5BbnksXG4gIGRhdGV0aW1lOiBcIjIwMTctMDEtMDFUMDE6MTE6MDFaXCIsXG4gIHJlc291cmNlSWQ6IFwibm9fcmVzb3VyY2VfaWRcIixcbiAgcmVzb3VyY2VUeXBlOiBSZXNvdXJjZVN0YXRpb25UeXBlLndlbGwsXG4gIHRpbWVzZXJpZXNJZDogXCJub190aW1lc2VyaWVzX2lkXCIsXG4gIHZhbHVlOiAwXG59Il19