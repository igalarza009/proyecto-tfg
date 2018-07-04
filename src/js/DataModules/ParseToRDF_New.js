import * as Virtuoso from '../Functions/VirtuosoCalls.js';
import * as Queries from '../Functions/SPARQLQueries.js';
import axios from 'axios';

const querystring = require('querystring');
const _ = require('lodash');
// const graphURI = "<http://www.sensores.com/ontology/prueba08/extrusoras#>";
const graphURI = "<http://www.sensores.com/ontology/pruebas_insert/extrusoras#>";
const virtuosoUrl =  'http://localhost:8890/sparql/';

export function parseDataToRDF_Sin(filename, values, timestamps, infoSensores){
	const prefixes = "prefix : " + graphURI + " " +
					"prefix owl: <http://www.w3.org/2002/07/owl#> " +
					"prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
					"prefix xsd: <http://www.w3.org/2001/XMLSchema#> " +
					"prefix sosa: <http://www.w3.org/ns/sosa/> ";
					// "base " + graphURI + " . ";

	const indexOfDot = filename.indexOf('.');
	const sensorIndicator = filename.substring(0, indexOfDot);
	const sensorName = 'sensor' + sensorIndicator;

	const currentSensor = _.find(infoSensores, ['indicatorId', sensorIndicator]);

	let observationResult = '';
	let dataToInsert = '';
	const observationType = currentSensor.observationType;
	const resultType = currentSensor.resultType;

	const valueType = (resultType === 'DoubleValueResult')
			? ("xsd:double")
			: ("xsd:boolean");

	let cont = 0;
	let i = 0;

	insertDataRecursive(i, cont, values, timestamps, prefixes, sensorName, observationType, resultType, valueType, dataToInsert);

}

function insertDataRecursive(index, cont, values, timestamps, prefixes, sensorName, observationType, resultType, valueType, dataToInsert){
	const value = values[index];
	if (index !== 0 && value !== ""){
		cont++;
		var dateTime = timestamps[index];
		var posGuion = dateTime.indexOf('-');
		var date = dateTime.substring(0, posGuion) + dateTime.substring(posGuion+1, posGuion+3) + dateTime.substring(posGuion+4, posGuion+6);
		// var value = element[1];

		var observationName = sensorName + "date" + date + "obs" + index;
		var observationResultName = observationName + "result";

		dataToInsert += ':' + observationName + ' rdf:type owl:NamedIndividual , ' +
			':' + observationType + ' . ' +
			':' + observationResultName + ' rdf:type owl:NamedIndividual , ' +
				':' + resultType + ' . ' +
			':' + observationResultName + ' sosa:hasSimpleResult "' + value + '"^^' + valueType + ' . ' +
			':' + observationName + ' sosa:hasResult :' + observationResultName + ' . ' +
			':' + observationName + ' sosa:resultTime "' + dateTime + '"^^xsd:dateTime . ' + //Añadir ^^xsd:dateTime
			':' + sensorName + ' sosa:madeObservation :' + observationName + ' . ';

		index++;

		if(index < values.length){
			if (cont === 160){
				var query = Queries.getInsertQuery(prefixes, dataToInsert);
				axios.post(virtuosoUrl,
					querystring.stringify({'query': query})
				)
				.then((response) => {
					console.log(response);
					dataToInsert = '';
					cont = 0;
					insertDataRecursive(index, cont, values, timestamps, prefixes, sensorName, observationType, resultType, valueType, dataToInsert);
				})
				.catch((error) => {
					console.log(error);
				});
			}
			else{
				insertDataRecursive(index, cont, values, timestamps, prefixes, sensorName, observationType, resultType, valueType, dataToInsert);
			}
		}
		else{
			if (cont > 0) {
				var query = Queries.getInsertQuery(prefixes, dataToInsert);
				axios.post(virtuosoUrl,
					querystring.stringify({'query': query})
				)
				.then((response) => {
					console.log("Última request");
					console.log(response);
				})
				.catch((error) => {
					console.log(error);
				});
			}
		}
	}
	else{
		index++;
		insertDataRecursive(index, cont, values, timestamps, prefixes, sensorName, observationType, resultType, valueType, dataToInsert);
	}
}
