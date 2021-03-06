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

// ------------------- FUNCIÓN "parseDataRecursiveList" -------------------
// Anotar en RDF el valor de la posición "index".
// ----------
// Estructura Objeto JSON parámtero:
// 	values: Array de los valores a traducir
// 	timestamps: Array de los timestamps
//  prefixes: String
//  sensorName: String
//  observationType: String
//  valueType: String
// ----------
export function parseDataRecursiveList(index, values, timestamps, prefixes, sensorName, observationType, valueType){

	let dataToInsert = '';

	values.forEach((value, i) => {
		let dateTime = timestamps[i];
		let posGuion = dateTime.indexOf('-');
		let date = dateTime.substring(0, posGuion) + dateTime.substring(posGuion+1, posGuion+3) + dateTime.substring(posGuion+4, posGuion+6);
		let obsNum = index + i;
		let observationName = sensorName + "date" + date + "obs" + obsNum;

		let fixedValue = value;
		if (value === 'NA'){
			// fixedValue = 'NaN';
			fixedValue = -50; // Añadido puesto que Virtuoso no admite el valor "NaN"^^xsd:double.
							 // De esta manera se diferencian la falta de valores con los valores nulos.
		}

		dataToInsert += ':' + observationName + ' rdf:type owl:NamedIndividual , ' +
			':' + observationType + ' . ' +
			':' + observationName + ' sosa:hasSimpleResult "' + fixedValue + '"^^' + valueType + ' . ' +
			':' + observationName + ' sosa:resultTime "' + dateTime + '"^^xsd:dateTime . ' +
			':' + sensorName + ' sosa:madeObservation :' + observationName + ' . ';
	})

	return dataToInsert;
}
