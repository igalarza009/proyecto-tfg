import * as Virtuoso from '../Functions/VirtuosoCalls.js';
import * as Queries from '../Functions/SPARQLQueries.js';
import axios from 'axios';

// const querystring = require('querystring');
const _ = require('lodash');
// const graphURI = "<http://www.sensores.com/ontology/prueba08/extrusoras#>";
// const graphURI = "<http://www.sensores.com/ontology/pruebas_insert/extrusoras#>";
const graphURI = "<http://www.sensores.com/ontology/datos_reduc/extrusoras#>";
// const virtuosoUrl =  'http://localhost:8890/sparql/';
// const virtuosoDebianUrl = 'http://35.237.115.247:8890/sparql';
// const usedURL = virtuosoUrl;

export function getInfoToParseData(filename, infoSensores){
	const virtPrefixes = "prefix : " + graphURI + " " +
						"prefix owl: <http://www.w3.org/2002/07/owl#> " +
						"prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
						"prefix xsd: <http://www.w3.org/2001/XMLSchema#> " +
						"prefix sosa: <http://www.w3.org/ns/sosa/> ";
						// "base " + graphURI + " . ";

	const indexOfDot = filename.indexOf('.');
	const sensorIndicator = filename.substring(0, indexOfDot);
	const sensorName = 'sensor' + sensorIndicator;

	const currentSensor = _.find(infoSensores, ['indicatorId', sensorIndicator]);

	// let observationResult = '';
	const observationType = currentSensor.observationType;
	const valueType = 'xsd:' + currentSensor.valueType;

	// let dataToInsert = '';
	// let cont = 0;
	// let i = 0;

	// console.log("Tiempo inicio " + Date.now());
	// insertDataRecursive(i, cont, values, timestamps, virtPrefixes, sensorName, observationType, valueType, dataToInsert);
	return {virtPrefixes:virtPrefixes, sensorName:sensorName, observationType:observationType, valueType:valueType}
}

export function parseDataRecursive(index, values, timestamps, prefixes, sensorName, observationType, valueType){

	const value = values[index];
	// if (index !== 0 && value !== ""){
	let dateTime = timestamps[index];
	let posGuion = dateTime.indexOf('-');
	let date = dateTime.substring(0, posGuion) + dateTime.substring(posGuion+1, posGuion+3) + dateTime.substring(posGuion+4, posGuion+6);

	let observationName = sensorName + "date" + date + "obs" + index;
	// var observationResultName = observationName + "result";

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

// export function parseDataToRDF_Sin(filename, values, timestamps, infoSensores){
// 	const virtPrefixes = "prefix : " + graphURI + " " +
// 						"prefix owl: <http://www.w3.org/2002/07/owl#> " +
// 						"prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
// 						"prefix xsd: <http://www.w3.org/2001/XMLSchema#> " +
// 						"prefix sosa: <http://www.w3.org/ns/sosa/> ";
// 						// "base " + graphURI + " . ";
//
// 	const indexOfDot = filename.indexOf('.');
// 	const sensorIndicator = filename.substring(0, indexOfDot);
// 	const sensorName = 'sensor' + sensorIndicator;
//
// 	const currentSensor = _.find(infoSensores, ['indicatorId', sensorIndicator]);
//
// 	let observationResult = '';
// 	const observationType = currentSensor.observationType;
// 	const valueType = 'xsd:' + currentSensor.valueType;
//
// 	let dataToInsert = '';
// 	let cont = 0;
// 	let i = 0;
//
// 	console.log("Tiempo inicio " + Date.now());
// 	insertDataRecursive(i, cont, values, timestamps, virtPrefixes, sensorName, observationType, valueType, dataToInsert);
//
// }

// function insertDataRecursive(index, cont, values, timestamps, prefixes, sensorName, observationType, valueType, dataToInsert){
//
// 	const value = values[index];
// 	// if (index !== 0 && value !== ""){
// 	let dateTime = timestamps[index];
// 	let posGuion = dateTime.indexOf('-');
// 	let date = dateTime.substring(0, posGuion) + dateTime.substring(posGuion+1, posGuion+3) + dateTime.substring(posGuion+4, posGuion+6);
//
// 	let observationName = sensorName + "date" + date + "obs" + index;
// 	// var observationResultName = observationName + "result";
//
// 	let fixedValue = value;
// 	if (value === 'NA'){
// 		fixedValue = 0;
// 	}
//
// 	dataToInsert += ':' + observationName + ' rdf:type owl:NamedIndividual , \n' +
// 		':' + observationType + ' . \n' +
// 		':' + observationName + ' sosa:hasSimpleResult "' + fixedValue + '"^^' + valueType + ' . \n' +
// 		':' + observationName + ' sosa:resultTime "' + dateTime + '"^^xsd:dateTime . \n' +
// 		':' + sensorName + ' sosa:madeObservation :' + observationName + ' . \n';
//
// 	index++;
// 	cont++;
// 	if(index < values.length){
// 		if (cont === 160){
// 			var query = Queries.getInsertQuery(prefixes, dataToInsert);
// 			axios.post(usedURL,
// 				querystring.stringify({'query': query})
// 			)
// 			.then((response) => {
// 				// console.log(response);
// 				dataToInsert = '';
// 				cont = 0;
// 				insertDataRecursive(index, cont, values, timestamps, prefixes, sensorName, observationType, valueType, dataToInsert);
// 			})
// 			.catch((error) => {
// 				console.log(error);
// 			});
// 		}
// 		else{
// 			insertDataRecursive(index, cont, values, timestamps, prefixes, sensorName, observationType, valueType, dataToInsert);
// 		}
// 	}
// 	else{
// 		if (cont > 0) {
// 			console.log('Ultima petición');
// 			var query = Queries.getInsertQuery(prefixes, dataToInsert);
// 			console.log(query);
// 			axios.post(usedURL,
// 				querystring.stringify({'query': query})
// 			)
// 			.then((response) => {
// 				console.log(response);
// 				console.log("Tiempo Final " + Date.now());
// 			})
// 			.catch((error) => {
// 				console.log(error);
// 			});
// 		}
// 	}
// }
