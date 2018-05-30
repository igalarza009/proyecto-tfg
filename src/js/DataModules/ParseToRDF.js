const infoSensores = require('../../infoSensores.json');
const graphURI = "<http://www.sensores.com/ontology/prueba03/extrusoras#>";

export function parseDataToRDF(filename, data){

	var _ = require('lodash');

	const prefixes = "@prefix : " + graphURI + " . \n" +
					"@prefix owl: <http://www.w3.org/2002/07/owl#> . \n" +
					"@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . \n" +
					"@prefix xsd: <http://www.w3.org/2001/XMLSchema#> . \n" +
					"@prefix sosa: <http://www.w3.org/ns/sosa/> . \n" +
					"@base " + graphURI + " . \n";

	const indexOfDot = filename.indexOf('.');
	const sensorIndicator = filename.substring(0, indexOfDot);
	const sensorName = 'sensor' + sensorIndicator;

	const currentSensor = _.find(infoSensores, ['indicatorId', sensorIndicator]);

	let observationResult = '';
	const observationType = currentSensor.observationType;
	const resultType = currentSensor.resultType;

	const valueType = (resultType === 'DoubleValueResult')
			? ("xsd:double")
			: ("xsd:boolean");

	data.forEach((element, index) => {
		if (index !== 0 && element[0] !== ""){
			var dateTime = element[0];
			var posGuion = dateTime.indexOf('-');
			var date = dateTime.substring(0, posGuion) + dateTime.substring(posGuion+1, posGuion+3) + dateTime.substring(posGuion+4, posGuion+6);
			var value = element[1];

			var observationName = sensorName + "date" + date + "obs" + index;
			var observationResultName = observationName + "result";

			observationResult = observationResult +
				':' + observationName + ' rdf:type owl:NamedIndividual , \n' +
					':' + observationType + ' . \n' +
				':' + observationResultName + ' rdf:type owl:NamedIndividual , \n' +
					':' + resultType + ' . \n' +
				':' + observationResultName + ' sosa:hasSimpleResult "' + value + '"^^' + valueType + ' . \n' +
				':' + observationName + ' sosa:hasResult :' + observationResultName + ' . \n' +
				':' + observationName + ' sosa:resultTime "' + dateTime + '"^^xsd:dateTime . \n' + //Añadir ^^xsd:dateTime
				':' + sensorName + ' sosa:madeObservation :' + observationName + ' . \n';
		}
	});

	// const finalResult = prefixes + sensorInitialization + observationResult;
	const finalResult = prefixes + observationResult;

	// console.log(finalResult);
	var file = new Blob([finalResult], {type: "text/plain"});
	var outputFileName = sensorName + '.ttl'

	if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, outputFileName);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = outputFileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }

}

// export function getInfoBeforeParsing(filename){
// 	var _ = require('lodash');
//
// 	const prefixes = "@prefix : <http://www.sensores.com/ontology/prueba02/extrusoras#> . \n" +
// 					"@prefix owl: <http://www.w3.org/2002/07/owl#> . \n" +
// 					"@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . \n" +
// 					"@prefix xsd: <http://www.w3.org/2001/XMLSchema#> . \n" +
// 					"@prefix sosa: <http://www.w3.org/ns/sosa/> . \n" +
// 					"@base <http://www.sensores.com/ontology/prueba02/extrusoras#> . \n";
//
// 	const indexOfDot = filename.indexOf('.');
// 	const sensorIndicator = filename.substring(0, indexOfDot);
// 	const sensorName = 'sensor' + sensorIndicator;
//
// 	const currentSensor = _.find(infoSensores, ['indicatorId', sensorIndicator]);
//
// 	// let observationResult = '';
// 	const observationType = currentSensor.observationType;
// 	const resultType = currentSensor.resultType;
//
// 	const valueType = (resultType === 'DoubleValueResult')
// 			? ("xsd:double")
// 			: ("xsd:boolean");
//
// 	return {'prefixes':prefixes, 'sensorName':sensorName, 'observationType':observationType, 'resultType':resultType, 'valueType':valueType};
// }

// export function parseEachRow(rowData, info){
// 	let observationResult = "";

// 	if (rowData[0] !== "date"){
// 		var dateTime = rowData[0];
// 		var posGuion = dateTime.indexOf('-');
// 		var date = dateTime.substring(0, posGuion) + dateTime.substring(posGuion+1, posGuion+3) + dateTime.substring(posGuion+4, posGuion+6);
// 		var value = rowData[1];
// 		if (value !== ""){
// 			var observationName = info['sensorName'] + "date" + date + "obs" + index;
// 			var observationResultName = observationName + "result";

// 			observationResult = ':' + observationName + ' rdf:type owl:NamedIndividual , \n' +
// 					':' + info['observationType'] + ' . \n' +
// 				':' + observationResultName + ' rdf:type owl:NamedIndividual , \n' +
// 					':' + info['resultType'] + ' . \n' +
// 				':' + observationResultName + ' sosa:hasSimpleResult "' + value + '"^^' + info['valueType'] + ' . \n' +
// 				':' + observationName + ' sosa:hasResult :' + observationResultName + ' . \n' +
// 				':' + observationName + ' sosa:resultTime "' + dateTime + '" . \n' + //Añadir ^^xsd:dateTime
// 				':' + info['sensorName'] + ' sosa:madeObservation :' + observationName + ' . \n';
// 		}
// 	}

// 	return observationResult;
// }

// export function downloadFinalFile(prefixes, observationResult){
// 	const finalResult = prefixes + observationResult;

// 	// console.log(finalResult);
// 	var file = new Blob([finalResult], {type: "text/plain"});
// 	var outputFileName = sensorName + '.ttl'

// 	if (window.navigator.msSaveOrOpenBlob) // IE10+
//         window.navigator.msSaveOrOpenBlob(file, outputFileName);
//     else { // Others
//         var a = document.createElement("a"),
//                 url = URL.createObjectURL(file);
//         a.href = url;
//         a.download = outputFileName;
//         document.body.appendChild(a);
//         a.click();
//         setTimeout(function() {
//             document.body.removeChild(a);
//             window.URL.revokeObjectURL(url);
//         }, 0);
//     }
// }
