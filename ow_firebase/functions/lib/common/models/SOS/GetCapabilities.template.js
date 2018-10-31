"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const template = `
<?xml version="1.0" encoding="UTF-8"?>
<sos:Capabilities version="2.0.0" xsi:schemaLocation="http://www.opengis.net/sos/2.0 http://schemas.opengis.net/sos/2.0/sos.xsd" xmlns:swe="http://www.opengis.net/swe/2.0" xmlns:swes="http://www.opengis.net/swes/2.0" xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:sos="http://www.opengis.net/sos/2.0" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:ogc="http://www.opengis.net/ogc" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
	<!-- ServiceIdentification contains general information about the service 
		like title, type and version as well as information about supported profiles 
		of the service -->
	<ows:ServiceIdentification>
		<ows:Title>OurWater SOS</ows:Title>
		<ows:Abstract>SOS interface to read groundwater data from OurWater</ows:Abstract>
		<ows:Keywords>
			<ows:Keyword>groundwater level</ows:Keyword>
			<ows:Keyword>monitoring</ows:Keyword>
			<ows:Keyword>timeseries</ows:Keyword>
		</ows:Keywords>
		<ows:ServiceType codeSpace="http://opengeospatial.net">OGC:SOS</ows:ServiceType>
		<ows:ServiceTypeVersion>2.0.0</ows:ServiceTypeVersion>
		<!-- XML binding -->
		<ows:Profile>http://www.opengis.net/spec/SOS/2.0/req/xml</ows:Profile>
		<!-- KVP binding -->
		<ows:Profile>http://www.opengis.net/spec/SOS/2.0/req/kvp-core</ows:Profile>
		<!-- supported profiles as -->
		<ows:Profile>http://www.opengis.net/spec/SOS/2.0/conf/gfoi</ows:Profile>
		<!-- <ows:Profile>http://www.opengis.net/spec/SOS/2.0/conf/obsByIdRetrieval</ows:Profile> -->
		<!-- TODO: add KVP BBOX profile when implemented -->
		<!-- Observation can be queries using spatial geometry expressed in param -->
		<ows:Profile>http://www.opengis.net/spec/SOS/2.0/conf/spatialFilteringProfile</ows:Profile>
		<!-- sampling feature must have a point geometry -->
		<ows:Profile>http://www.opengis.net/spec/OMXML/2.0/conf/samplingPoint</ows:Profile>
		<!-- Observation encoded with GML 3.2 XML -->
		<ows:Profile>http://www.opengis.net/spec/OMXML/2.0/conf/observation</ows:Profile>
		<!-- this service implement WaterML 2.0 -->
		<ows:Profile>http://www.opengis.net/spec/waterml/2.0/conf/xsd-observation-process</ows:Profile>
		<ows:Fees>NONE</ows:Fees>
		<ows:AccessConstraints>NONE</ows:AccessConstraints>
	</ows:ServiceIdentification>
	<!-- ServiceProvider section contains information about service provider 
		like contact, adress, etc. -->
	<ows:ServiceProvider>
		<ows:ProviderName>Vessels Tech, Pty Ltd.</ows:ProviderName>
		<ows:ProviderSite xlink:href="https://vesselstech.com"></ows:ProviderSite>
		<ows:ServiceContact>
			<ows:IndividualName>Lewis Daly</ows:IndividualName>
			<ows:PositionName>CTO</ows:PositionName>
			<ows:Role></ows:Role>
		</ows:ServiceContact>
	</ows:ServiceProvider>
	<!-- extension is used for providing profile specific sections; in this 
		case, the InsertionCapabilities section is contained, because the SOS supports 
		the obs- and resultInsertion profiles -->
	<!-- the filterCapabilities section lists the filters and operands which 
		are supported in the observation, result and feature retrieval operations -->
	<ows:OperationsMetadata>
		<ows:Operation name="GetCapabilities">
			<ows:DCP>
				<ows:HTTP>
					<ows:Get xlink:href="{{sosServiceUrl}}"></ows:Get>
				</ows:HTTP>
			</ows:DCP>
			<ows:Parameter name="updateSequence">
				<ows:AnyValue></ows:AnyValue>
			</ows:Parameter>
			<ows:Parameter name="AcceptVersions">
				<ows:AllowedValues>
					<ows:Value>2.0.0</ows:Value>
				</ows:AllowedValues>
			</ows:Parameter>
			<ows:Parameter name="Sections">
				<ows:AllowedValues>
					<ows:Value>ServiceIdentification</ows:Value>
					<ows:Value>ServiceProvider</ows:Value>
					<ows:Value>OperationsMetadata</ows:Value>
					<ows:Value>FilterCapabilities</ows:Value>
					<ows:Value>Contents</ows:Value>
					<ows:Value>All</ows:Value>
				</ows:AllowedValues>
			</ows:Parameter>
			<ows:Parameter name="AcceptFormats">
				<ows:AllowedValues>
					<ows:Value>text/xml</ows:Value>
				</ows:AllowedValues>
			</ows:Parameter>
		</ows:Operation>
		<ows:Operation name="DescribeSensor">
			<ows:DCP>
				<ows:HTTP>
					<ows:Get xlink:href="{{sosServiceUrl}}"></ows:Get>
				</ows:HTTP>
			</ows:DCP>
			<ows:Parameter name="procedure">
				<ows:AllowedValues>
					
					<ows:Value>{{procedureUri}}</ows:Value>
				</ows:AllowedValues>
			</ows:Parameter>
			<ows:Parameter name="procedureDescriptionFormat">
				<ows:AllowedValues>
					<ows:Value>http://www.opengis.net/sensorML/1.0.1</ows:Value>
				</ows:AllowedValues>
			</ows:Parameter>
		</ows:Operation>
		<ows:Operation name="GetObservation">
			<ows:DCP>
				<ows:HTTP>
					<ows:Get xlink:href="{{sosServiceUrl}}"></ows:Get>
				</ows:HTTP>
			</ows:DCP>
			<ows:Parameter name="srsName">
				<ows:NoValues></ows:NoValues>
			</ows:Parameter>
			<ows:Parameter name="offering">
				<ows:AllowedValues>
					<ows:Value>GW_LEVEL</ows:Value>
				</ows:AllowedValues>
			</ows:Parameter>
			<ows:Parameter name="temporalFilter">
				<ows:AllowedValues>
					<ows:Range>
						<ows:MinimumValue>1900-04-01T17:43:00+02:00</ows:MinimumValue>
						<ows:MaximumValue>2020-04-01T17:51:00+02:00</ows:MaximumValue>
					</ows:Range>
				</ows:AllowedValues>
			</ows:Parameter>
			<ows:Parameter name="procedure">
				<ows:AllowedValues>
					<ows:Value>{{procedureUri}}</ows:Value>
				</ows:AllowedValues>
			</ows:Parameter>
			<ows:Parameter name="observedProperty">
				<ows:AllowedValues>
					<ows:Value>{{observedPropertyUri}}</ows:Value>
				</ows:AllowedValues>
			</ows:Parameter>
			<ows:Parameter name="result">
				<ows:AnyValue></ows:AnyValue>
			</ows:Parameter>
			<ows:Parameter name="responseFormat">
				<ows:AllowedValues>
					<ows:Value>http://www.opengis.net/waterml/2.0</ows:Value>
					<ows:Value>application/zip</ows:Value>
				</ows:AllowedValues>
			</ows:Parameter>
		</ows:Operation>
		<ows:Operation name="GetFeatureOfInterest">
			<ows:DCP>
				<ows:HTTP>
					<ows:Get xlink:href="{{sosServiceUrl"></ows:Get>
				</ows:HTTP>
			</ows:DCP>
			<ows:Parameter name="featureOfInterest">
				<ows:NoValues></ows:NoValues>
			</ows:Parameter>
			<ows:Parameter name="observableProperty">
				<ows:AllowedValues>
					<ows:Value>{{observedPropertyUri}}</ows:Value>
				</ows:AllowedValues>
			</ows:Parameter>
			<ows:Parameter name="procedure">
				<ows:AllowedValues>
					<ows:Value>{{procedureUri}}</ows:Value>
				</ows:AllowedValues>
			</ows:Parameter>
			<ows:Parameter name="spatialFilter">
				<ows:AnyValue></ows:AnyValue>
			</ows:Parameter>
		</ows:Operation>
		<ows:Parameter name="service">
			<ows:AllowedValues>
				<ows:Value>SOS</ows:Value>
			</ows:AllowedValues>
		</ows:Parameter>
		<ows:Parameter name="version">
			<ows:AllowedValues>
				<ows:Value>2.0.0</ows:Value>
			</ows:AllowedValues>
		</ows:Parameter>
	</ows:OperationsMetadata>
	<sos:filterCapabilities>
		<fes:Filter_Capabilities>
			<fes:Conformance>
				<fes:Constraint name="ImplementsQuery">
					<ows:NoValues></ows:NoValues>
					<ows:DefaultValue>false</ows:DefaultValue>
				</fes:Constraint>
				<fes:Constraint name="ImplementsAdHocQuery">
					<ows:NoValues></ows:NoValues>
					<ows:DefaultValue>false</ows:DefaultValue>
				</fes:Constraint>
				<fes:Constraint name="ImplementsFunctions">
					<ows:NoValues></ows:NoValues>
					<ows:DefaultValue>false</ows:DefaultValue>
				</fes:Constraint>
				<fes:Constraint name="ImplementsMinStandardFilter">
					<ows:NoValues></ows:NoValues>
					<ows:DefaultValue>false</ows:DefaultValue>
				</fes:Constraint>
				<fes:Constraint name="ImplementsStandardFilter">
					<ows:NoValues></ows:NoValues>
					<ows:DefaultValue>false</ows:DefaultValue>
				</fes:Constraint>
				<fes:Constraint name="ImplementsMinSpatialFilter">
					<ows:NoValues></ows:NoValues>
					<ows:DefaultValue>true</ows:DefaultValue>
				</fes:Constraint>
				<fes:Constraint name="ImplementsSpatialFilter">
					<ows:NoValues></ows:NoValues>
					<ows:DefaultValue>true</ows:DefaultValue>
				</fes:Constraint>
				<fes:Constraint name="ImplementsMinTemporalFilter">
					<ows:NoValues></ows:NoValues>
					<ows:DefaultValue>true</ows:DefaultValue>
				</fes:Constraint>
				<fes:Constraint name="ImplementsTemporalFilter">
					<ows:NoValues></ows:NoValues>
					<ows:DefaultValue>true</ows:DefaultValue>
				</fes:Constraint>
				<fes:Constraint name="ImplementsVersionNav">
					<ows:NoValues></ows:NoValues>
					<ows:DefaultValue>false</ows:DefaultValue>
				</fes:Constraint>
				<fes:Constraint name="ImplementsSorting">
					<ows:NoValues></ows:NoValues>
					<ows:DefaultValue>false</ows:DefaultValue>
				</fes:Constraint>
				<fes:Constraint name="ImplementsExtendedOperators">
					<ows:NoValues></ows:NoValues>
					<ows:DefaultValue>false</ows:DefaultValue>
				</fes:Constraint>
			</fes:Conformance>
			<fes:Spatial_Capabilities>
				<fes:GeometryOperands>
					<fes:GeometryOperand name="gml:Point"></fes:GeometryOperand>
					<fes:GeometryOperand name="gml:Polygon"></fes:GeometryOperand>
				</fes:GeometryOperands>
				<fes:SpatialOperators>
					<fes:SpatialOperator name="BBOX"></fes:SpatialOperator>
					<fes:SpatialOperator name="Intersects"></fes:SpatialOperator>
					<fes:SpatialOperator name="Within"></fes:SpatialOperator>
				</fes:SpatialOperators>
			</fes:Spatial_Capabilities>
			<fes:Temporal_Capabilities>
				<fes:TemporalOperands>
					<fes:TemporalOperand name="gml:TimePeriod"></fes:TemporalOperand>
					<fes:TemporalOperand name="gml:TimeInstant"></fes:TemporalOperand>
				</fes:TemporalOperands>
				<fes:TemporalOperators>
					<fes:TemporalOperator name="During"></fes:TemporalOperator>
					<fes:TemporalOperator name="After"></fes:TemporalOperator>
					<fes:TemporalOperator name="TEquals"></fes:TemporalOperator>
				</fes:TemporalOperators>
			</fes:Temporal_Capabilities>
		</fes:Filter_Capabilities>
	</sos:filterCapabilities>
	<!-- The contents section contains information about the observations offered 
		by the service. The observations are group per sensor(-system) into observation 
		offerings. -->
	<sos:contents>
		<sos:Contents>
			<swes:offering><sos:ObservationOffering xmlns:swe="http://www.opengis.net/swe/2.0" xmlns:swes="http://www.opengis.net/swes/2.0" xmlns:fes="http://www.opengis.net/fes/2.0" xmlns:sos="http://www.opengis.net/sos/2.0" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:ogc="http://www.opengis.net/ogc" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink">
	<swes:identifier>GW_LEVEL</swes:identifier>
	<swes:procedure>urn:ogc:object:Sensor::GIN_GroundwaterLevelProcess</swes:procedure>
	<swes:procedureDescriptionFormat>http://www.opengis.net/sensorML/1.0.1
	</swes:procedureDescriptionFormat>
	<swes:observableProperty>{{observedPropertyUri}}</swes:observableProperty>
	<sos:observedArea>
		<gml:Envelope srsName="http://www.opengis.net/def/crs/EPSG/0/4326">
			<gml:lowerCorner>{{observableAreaLowerCorner}}</gml:lowerCorner>
			<gml:upperCorner>{{observableAreaUpperCorner}}</gml:upperCorner>
		</gml:Envelope>
	</sos:observedArea>
	<sos:phenomenonTime>
		<gml:TimePeriod gml:id="phenomenonTime">
			<gml:beginPosition>1956-04-30T12:00:00Z</gml:beginPosition>
			<gml:endPosition>2020-11-02T12:00:00Z</gml:endPosition>
		</gml:TimePeriod>
	</sos:phenomenonTime>
</sos:ObservationOffering></swes:offering>
			<sos:responseFormat>http://www.opengis.net/om/2.0</sos:responseFormat>
			<sos:observationType>http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement</sos:observationType>
		</sos:Contents>
	</sos:contents>
</sos:Capabilities>`;
exports.default = template;
//# sourceMappingURL=GetCapabilities.template.js.map