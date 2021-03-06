// const infoSensores = require('../../infoSensores.json');
// const graphURI = "<http://www.sensores.com/ontology/prueba08/extrusoras#>";
// const graphURI = '<http://www.sensores.com/ontology/pruebas_fixed/extrusoras#>';
// const graphURI = "<http://www.sensores.com/ontology/nuevo_02/extrusoras#>";
const graphURI = "<http://www.sensores.com/ontology/datos_reduc/extrusoras#>";
const _ = require('lodash');

export function parseDataToRDF(filename, values, timestamps, infoSensores){

	const prefixes = "@prefix : " + graphURI + " . \n" +
					"@prefix owl: <http://www.w3.org/2002/07/owl#> . \n" +
					"@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . \n" +
					"@prefix xsd: <http://www.w3.org/2001/XMLSchema#> . \n" +
					"@prefix sosa: <http://www.w3.org/ns/sosa/> . \n" +
					"@base " + graphURI + " . \n";

	const indexOfDot = filename.indexOf('.');
	const sensorIndicator = filename.substring(0, indexOfDot);
	const sensorName = 'sensor' + sensorIndicator;

	const currentSensor = _.find(infoSensores, {indicatorId:sensorIndicator});

	let observationResult = '';
	const observationType = currentSensor.observationType;
	// const resultType = currentSensor.resultType;
	const valueType = 'xsd:' + currentSensor.valueType;

	// const valueType = (resultType === 'DoubleValueResult')
	// 		? ("xsd:double")
	// 		: ("xsd:boolean");

	values.forEach((value, index) => {
		// if (value !== ""){
			var dateTime = timestamps[index];
			var posGuion = dateTime.indexOf('-');
			var date = dateTime.substring(0, posGuion) + dateTime.substring(posGuion+1, posGuion+3) + dateTime.substring(posGuion+4, posGuion+6);
			// var value = element[1];

			var observationName = sensorName + "date" + date + "obs" + index;
			// var observationResultName = observationName + "result";

			let fixedValue = value;
			if (value === 'NA'){
				fixedValue = 'NaN';
			}

			observationResult = observationResult +
				':' + observationName + ' rdf:type owl:NamedIndividual , \n' +
					':' + observationType + ' . \n' +
				// ':' + observationResultName + ' rdf:type owl:NamedIndividual , \n' +
				// 	':' + resultType + ' . \n' +
				':' + observationName + ' sosa:hasSimpleResult "' + fixedValue + '"^^' + valueType + ' . \n' +
				// ':' + observationName + ' sosa:hasResult :' + observationResultName + ' . \n' +
				':' + observationName + ' sosa:resultTime "' + dateTime + '"^^xsd:dateTime . \n' + //Añadir ^^xsd:dateTime
				':' + sensorName + ' sosa:madeObservation :' + observationName + ' . \n';
		// }
	});

	// const finalResult = prefixes + sensorInitialization + observationResult;
	const finalResult = prefixes + observationResult;

	// console.log(finalResult);
	var file = new Blob([finalResult], {type: "text/plain"});
	// var outputFileName = sensorName + '.ttl'
	//
	// if (window.navigator.msSaveOrOpenBlob) // IE10+
    //     window.navigator.msSaveOrOpenBlob(file, outputFileName);
    // else { // Others
    //     var a = document.createElement("a"),
    //             url = URL.createObjectURL(file);
    //     a.href = url;
    //     a.download = outputFileName;
    //     document.body.appendChild(a);
    //     a.click();
    //     setTimeout(function() {
    //         document.body.removeChild(a);
    //         window.URL.revokeObjectURL(url);
    //     }, 0);
    // }
	return file;

}
