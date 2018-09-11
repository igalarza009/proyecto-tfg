// ParseToRDF.js
// --------------------------------------------------------------
// Funciones para la traducción de los datos a formato RDF.
// --------------------------------------------------------------

const _ = require('lodash');

// ------------------- FUNCIÓN "getInfoToParseData" -------------------
// Obtener información previa necesaria para la transformación a RDF.
// ----------
// Estructura Objeto JSON parámtero:
// 	filename: Nombre del archivo
// 	infoSensores: Collection
// ----------
export function getInfoToParseData(filename, infoSensores, graphURI){
	const virtPrefixes = "prefix : " + graphURI + " " +
						"prefix owl: <http://www.w3.org/2002/07/owl#> " +
						"prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
						"prefix xsd: <http://www.w3.org/2001/XMLSchema#> " +
						"prefix sosa: <http://www.w3.org/ns/sosa/> ";

	const indexOfDot = filename.indexOf('.');
	const sensorIndicator = filename.substring(0, indexOfDot);
	const sensorName = 'sensor' + sensorIndicator;

	const currentSensor = _.find(infoSensores, ['indicatorId', sensorIndicator]);

	const observationType = currentSensor.observationType;
	const valueType = 'xsd:' + currentSensor.valueType;

	return {virtPrefixes:virtPrefixes, sensorName:sensorName, observationType:observationType, valueType:valueType}
}

// ------------------- FUNCIÓN "parseDataRecursive" -------------------
// Anotar en RDF el valor de la posición "index".
// ----------
// Estructura Objeto JSON parámtero:
// 	index: Posición del valor a anotar
// 	values: ...
// 	timestamps: ...
//  prefixes: ...
//  sensorName: ...
//  observationType: ...
//  valueType: ...
// ----------
export function parseDataRecursive(index, values, timestamps, prefixes, sensorName, observationType, valueType){

	const value = values[index];
	let dateTime = timestamps[index];
	let posGuion = dateTime.indexOf('-');
	let date = dateTime.substring(0, posGuion) + dateTime.substring(posGuion+1, posGuion+3) + dateTime.substring(posGuion+4, posGuion+6);

	let observationName = sensorName + "date" + date + "obs" + index;

	let fixedValue = value;
	if (value === 'NA'){
		fixedValue = 'NaN';
	}

	let dataToInsert = ':' + observationName + ' rdf:type owl:NamedIndividual , \n' +
		':' + observationType + ' . \n' +
		':' + observationName + ' sosa:hasSimpleResult "' + fixedValue + '"^^' + valueType + ' . \n' +
		':' + observationName + ' sosa:resultTime "' + dateTime + '"^^xsd:dateTime . \n' +
		':' + sensorName + ' sosa:madeObservation :' + observationName + ' . \n';

	return dataToInsert;
}
