var _ = require('lodash');
const infoSensores = require('../../infoSensores.json');
const maxChartPoints = 4500;
const reducDataValues = 1000;

// Prepare data of Information and Relation queries
export function prepareResponseData(sensorsResponse, info){
	// const results = responseData["results"]["bindings"];
	let selectedValues = [];
	let selectDateTime = '';
	if (info['type'] === 'infor'){
		if (!info['groupBy']['groupByAll']){
			if (info['groupBy']['groupBy']){
				if (info['groupBy']['groupByDate'])
					selectDateTime = 'resultDate';
				else if (info['groupBy']['groupByHour'])
					selectDateTime = 'resultHour';

				if (info['groupBy']['avg'])
					selectedValues.push('avgValue');

				if (info['groupBy']['min'])
					selectedValues.push('minValue');

				if (info['groupBy']['max'])
					selectedValues.push('maxValue');
			}
			else {
				selectedValues.push('resultValue');
				selectDateTime = "resultTime";
			}
		}
	}
	else{
		selectedValues.push('resultValue');
		selectDateTime = "resultTime";
	}

	let parsedResults = parseSensorValues(sensorsResponse, info['sensors'], selectedValues, selectDateTime, {});

	console.log(parsedResults);

	let sensorValues = parsedResults['sensorValues'];
	let datetimes = parsedResults['datetimes'];

	let allChartData = prepareDataForGoogleCharts(info['sensors'], selectedValues, sensorValues, datetimes, {'type':info['type']});

	console.log(allChartData);

	return allChartData;
}

export function prepareResponseDataIndividual(sensorsResponse, info){
	// const results = responseData["results"]["bindings"];
	let selectedValues = [];
	let selectDateTime = '';
	if (info['type'] === 'infor'){
		if (!info['groupBy']['groupByAll']){
			if (info['groupBy']['groupBy']){
				if (info['groupBy']['groupByDate'])
					selectDateTime = 'resultDate';
				else if (info['groupBy']['groupByHour'])
					selectDateTime = 'resultHour';

				if (info['groupBy']['avg'])
					selectedValues.push('avgValue');

				if (info['groupBy']['min'])
					selectedValues.push('minValue');

				if (info['groupBy']['max'])
					selectedValues.push('maxValue');
			}
			else {
				selectedValues.push('resultValue');
				selectDateTime = "resultTime";
			}
		}
	}
	else{
		selectedValues.push('resultValue');
		selectDateTime = "resultTime";
	}

	let parsedResults = parseSensorValues(sensorsResponse, info['sensors'], selectedValues, selectDateTime, {});

	console.log(parsedResults);

	let sensorValues = parsedResults['sensorValues'];
	let datetimes = parsedResults['datetimes'];

	let allChartData = prepareDataForGoogleCharts(info['sensors'], selectedValues, sensorValues, datetimes, {'type':info['type']});

	console.log(allChartData);

	return allChartData;
}

export function prepareVariablesSplit(selectedSensors, groupBy, filter, orderBy, type){
    let sensorsResponse = {};
    let selectValue = '';
    let selectDateTime = '';

    if (type === 'infor'){
		if (!groupBy['groupByAll']){
			if (groupBy['groupBy']){
				if (groupBy['groupByDate']){
                    selectDateTime = 'resultDate';
                    sensorsResponse['datetimes'] = ['Fecha'];
                }
				else if (groupBy['groupByHour']){
                    selectDateTime = 'resultHour';
                    sensorsResponse['datetimes'] = ['Hora'];
                }

				if (groupBy['avg'])
					selectValue = 'avgValue';
				else if (groupBy['min'])
					selectValue = 'minValue';
				else if (groupBy['max'])
					selectValue = 'maxValue';
			}
			else {
				selectValue = 'resultValue';
				selectDateTime = "resultTime";
				sensorsResponse['datetimes'] = ['Fecha y Hora'];
			}
		}
	}
	else{
		selectValue = 'resultValue';
		selectDateTime = "resultTime";
        sensorsResponse['datetimes'] = ['Fecha y Hora'];
	}

	selectedSensors.forEach((sensorId) => {
		sensorsResponse[sensorId] = [sensorId];
	});

    return {'sensorsResponse':sensorsResponse, 'selectValue':selectValue, 'selectDateTime':selectDateTime};

}

export function prepareResponseDataSplit(response, sensorId, calcDatetimes, selectValue, selectDateTime){

	let parsedResults = parseSensorValuesSplit(response, sensorId, calcDatetimes, selectValue, selectDateTime, {});

	// console.log(parsedResults);
    //
	let sensorValues = parsedResults['values'];
	let datetimes = parsedResults['datetimes'];
	let lastTimestamp = parsedResults['lastTimestamp'];

	// let reducedParsedResults = reduceParsedResultsSplit(sensorValues, datetimes);

	// let allChartData = prepareDataForGoogleCharts(info['sensors'], selectedValues, sensorValues, datetimes, {'type':info['type']});
    //
	// console.log(allChartData);
    //
	// return allChartData;

    return parsedResults;
}

// function reduceParsedResultsSplit(sensorValues, datetimes){
//
// }

// Prepare data for Anomalias queries
export function prepareResponseDataAnomalias(results, selectedSensors, sensorDir, parMotor){
	// const results = response["results"]["bindings"];

	let selectValues = ["resultValue"];
	let selectDateTime = "resultTime";

	let separateResults = parseSensorValues(results, selectedSensors, selectValues, selectDateTime, parMotor);

	let datetimes = separateResults['datetimes'];
	let sensorValues = separateResults['sensorValues'];

	console.log(separateResults);

	let anomValuesResult = getAnomaliasValues(selectedSensors, sensorDir, sensorValues, datetimes, parMotor);

	let anomDatetimes = anomValuesResult['anomDatetimes'];
	let anomValues = anomValuesResult['anomValues'];

	console.log(anomValuesResult);

	let allChartData = prepareDataForGoogleCharts(selectedSensors, selectValues, anomValues, anomDatetimes, {'parMotor': parMotor, 'type': 'anom'});

	return allChartData;
}

// Parse the returned values to easier format
function parseSensorValues(sensorsResponse, selectedSensors, selectValues, selectDateTime, parMotor){
	let sensorValuesSep = {};
	let datetimes = [];

	if (selectDateTime === "resultHour"){
		datetimes.push("Hora");
	}
	else if (selectDateTime === "resultDate"){
		datetimes.push("Fecha");
	}
	else if (selectDateTime === "resultTime"){
		datetimes.push("Fecha y hora");
	}

	if (selectValues.length === 1){
		selectedSensors.forEach((sensorId) => {
			sensorValuesSep[sensorId] = [sensorId];
		});
	}
	else{
		selectedSensors.forEach((sensorId) => {
			sensorValuesSep[sensorId] = {};
			selectValues.forEach((selectValue) => {
				sensorValuesSep[sensorId][selectValue] = [selectValue];
			})
		});
	}
	_.forEach(sensorsResponse, (values, sensorId) => {
		values.forEach((result) => {
			var sensorNameValue = result["sensorName"]["value"];
			var indexName = sensorNameValue.indexOf('#');
			var sensorId = sensorNameValue.substring(indexName+7);
			if (selectDateTime !== '' && selectedSensors[0] === sensorId){
				var resultDateTimeValue = result[selectDateTime]["value"];
				var datetime;
				if (selectDateTime === 'resultDate'){
					var indexFirstDash = resultDateTimeValue.indexOf('-');
					var year = parseInt(resultDateTimeValue.substring(0,indexFirstDash),10);
					var monthNumber = parseInt(resultDateTimeValue.substring(indexFirstDash+1, indexFirstDash+3), 10);
					var day = parseInt(resultDateTimeValue.substring(indexFirstDash+4,indexFirstDash+6),10);
					datetime = new Date(year, monthNumber-1, day);
				}
				else if (selectDateTime === 'resultHour'){
					var indexFirstSep = resultDateTimeValue.indexOf(':');
					var hour = parseInt(resultDateTimeValue.substring(0,indexFirstSep),10);
					// var min = parseInt(resultDateTimeValue.substring(indexFirstSep+1, indexFirstSep+3), 10);
					// var sec = parseInt(resultDateTimeValue.substring(indexFirstSep+4,indexFirstSep+6),10);
					// var milsec = parseInt(resultDateTimeValue.substring(indexFirstSep+7,indexFirstSep+10),10);
					datetime = hour + ":00 - " + (hour + 1) + ":00";
					// datetime = new Date (0, 0, 0, hour, min, sec, milsec);
				}
				else {
					var indexFirstDash = resultDateTimeValue.indexOf('-');
					var year = parseInt(resultDateTimeValue.substring(0,indexFirstDash),10);
					var monthNumber = parseInt(resultDateTimeValue.substring(indexFirstDash+1, indexFirstDash+3), 10);
					var day = parseInt(resultDateTimeValue.substring(indexFirstDash+4,indexFirstDash+6),10);
					var indexTime = resultDateTimeValue.indexOf('T');
					var hour = parseInt(resultDateTimeValue.substring(indexTime+1,indexTime+3),10);
					var min = parseInt(resultDateTimeValue.substring(indexTime+4, indexTime+6), 10);
					var sec = parseInt(resultDateTimeValue.substring(indexTime+7, indexTime+9),10);
					var milsec = parseInt(resultDateTimeValue.substring(indexTime+10,indexTime+13),10);
					// datetime = resultDateTimeValue;
					// console.log(resultDateTimeValue);
					// console.log(year + monthNumber-1 + day + hour + min + sec + milsec);
					datetime = new Date(year, monthNumber-1, day, hour, min, sec, milsec);
				}
			datetimes.push(datetime);
			}

			if (selectValues.length === 1){
				if (parMotor['parMotorId'] && parMotor['parMotorId'] === sensorId && parMotor['calParMotor'] === true){ // [79PWN7] * 0.00302) * 3.84
					// console.log("Calcular Par Motor.");
					let parMotorValue = (parseFloat(result[selectValues[0]]["value"]) * 0.00302) * 3.84;
					sensorValuesSep[sensorId].push(parMotorValue);
				}
				else{
					sensorValuesSep[sensorId].push(parseFloat(result[selectValues[0]]["value"]));
				}
			}
			else{
				selectValues.forEach((selectValue) => {
					sensorValuesSep[sensorId][selectValue].push(parseFloat(result[selectValue]["value"]));
				});
			}
		});
	});

	return {'sensorValues':sensorValuesSep, 'datetimes':datetimes };
}

export function parseSensorValuesSplit(response, sensorId, calcDatetimes, selectValue, selectDateTime, parMotor){
    let datetimes = [];
    let parsedValues = [];
    let lastTimestamp = '';

	response.forEach((result) => {
		var sensorNameValue = result["sensorName"]["value"];
		// var indexName = sensorNameValue.indexOf('#');
		// var sensorId = sensorNameValue.substring(indexName+7);
        if (selectDateTime != ''){
            lastTimestamp = result[selectDateTime]["value"];
        }

		if (calcDatetimes && selectDateTime !== ''){
			var resultDateTimeValue = result[selectDateTime]["value"];
			var datetime;
			if (selectDateTime === 'resultDate'){
				var indexFirstDash = resultDateTimeValue.indexOf('-');
				var year = parseInt(resultDateTimeValue.substring(0,indexFirstDash),10);
				var monthNumber = parseInt(resultDateTimeValue.substring(indexFirstDash+1, indexFirstDash+3), 10);
				var day = parseInt(resultDateTimeValue.substring(indexFirstDash+4,indexFirstDash+6),10);
				datetime = new Date(year, monthNumber-1, day);
			}
			else if (selectDateTime === 'resultHour'){
				var indexFirstSep = resultDateTimeValue.indexOf(':');
				var hour = parseInt(resultDateTimeValue.substring(0,indexFirstSep),10);
				// var min = parseInt(resultDateTimeValue.substring(indexFirstSep+1, indexFirstSep+3), 10);
				// var sec = parseInt(resultDateTimeValue.substring(indexFirstSep+4,indexFirstSep+6),10);
				// var milsec = parseInt(resultDateTimeValue.substring(indexFirstSep+7,indexFirstSep+10),10);
				datetime = hour + ":00 - " + (hour + 1) + ":00";
				// datetime = new Date (0, 0, 0, hour, min, sec, milsec);
			}
			else {
				var indexFirstDash = resultDateTimeValue.indexOf('-');
				var year = parseInt(resultDateTimeValue.substring(0,indexFirstDash),10);
				var monthNumber = parseInt(resultDateTimeValue.substring(indexFirstDash+1, indexFirstDash+3), 10);
				var day = parseInt(resultDateTimeValue.substring(indexFirstDash+4,indexFirstDash+6),10);
				var indexTime = resultDateTimeValue.indexOf('T');
				var hour = parseInt(resultDateTimeValue.substring(indexTime+1,indexTime+3),10);
				var min = parseInt(resultDateTimeValue.substring(indexTime+4, indexTime+6), 10);
				var sec = parseInt(resultDateTimeValue.substring(indexTime+7, indexTime+9),10);
				var milsec = parseInt(resultDateTimeValue.substring(indexTime+10,indexTime+13),10);
				// datetime = resultDateTimeValue;
				// console.log(resultDateTimeValue);
				// console.log(year + monthNumber-1 + day + hour + min + sec + milsec);
				datetime = new Date(year, monthNumber-1, day, hour, min, sec, milsec);
			}
		    datetimes.push(datetime);
		}

		if (parMotor['parMotorId'] && parMotor['parMotorId'] === sensorId && parMotor['calParMotor'] === true){ // [79PWN7] * 0.00302) * 3.84
			let parMotorValue = (parseFloat(result[selectValue]["value"]) * 0.00302) * 3.84;
			parsedValues.push(parMotorValue);
		}
		else{
			parsedValues.push(parseFloat(result[selectValue]["value"]));
		}
	});

	return {'values':parsedValues, 'datetimes':datetimes, 'lastTimestamp':lastTimestamp };
}

function prepareDataForGoogleCharts(selectedSensors, selectValues, sensorValues, datetimes, info){
	//info: parMotor, type
	let allChartData = [];

	if (selectValues.length === 1){
		console.log("Hola 1");
		let dataToZip = [datetimes];

		selectedSensors.forEach((sensorId) => {
			dataToZip.push(sensorValues[sensorId]);
		});

		let chartData = _.zip.apply(_,dataToZip);

		console.log(chartData);

		let reducedChartData = reduceChartPoints(chartData, maxChartPoints);

		let chartFullData = {};

		let title;
		if (info['type']==='infor'){
			title = 'Información general.';
		}
		else if (info['type']==='otro'){
			title = 'Relación entre sensores.';
		}
		else{
			title = 'Búsqueda de anomalías.';
		}
		chartFullData['title'] = title;

		chartFullData['subtitle'] = "";
		selectedSensors.forEach((sensorId, i) => {
			if (i !== (selectedSensors.length - 1)){
				chartFullData['subtitle'] += sensorId + ", ";
			}
			else{
				chartFullData['subtitle'] += sensorId;
			}
		})

		chartFullData['y-axis'] = [];
		selectedSensors.forEach((sensorId, i) => {
				if (info['parMotor'] && info['parMotor']['parMotorId'] === sensorId && info['parMotor']['calParMotor'] === true){
					chartFullData['y-axis'].push(['ParMotor', 'Par Motor']);
				}
				else{
					var sensor = _.find(infoSensores, ['indicatorId', sensorId]);
					var axisTitle = sensor['observedProperty'];
					var unit = sensor['measureUnit'];
					var axisLabel = axisTitle + " (" + unit + ")"
					var axisData = [axisTitle, axisLabel];
					chartFullData['y-axis'].push(axisData);
				}
		});

		chartFullData['data'] = reducedChartData;

		allChartData.push(chartFullData);
	}
	else{
		console.log("Hola 1");
		_.forEach(sensorValues, (sensorData, sensorId) =>{
			var dataToZip = [datetimes];

			_.forEach(sensorData, (data, selectHeader) =>{
				dataToZip.push(data);
			});

			var chartData = _.zip.apply(_,dataToZip);

			console.log(chartData);

			let reducedChartData = reduceChartPoints(chartData, maxChartPoints);

			let chartFullData = {};

			chartFullData['title'] = "Información del sensor: "+ sensorId;

			var sensor = _.find(infoSensores, ['indicatorId', sensorId]);
			var axisTitle = sensor['observedProperty'];
			var unit = sensor['measureUnit'];
			var axisLabel = axisTitle + " (" + unit + ")"
			chartFullData['y-axis'] = [axisTitle, axisLabel];

			chartFullData['data'] = reducedChartData;

			allChartData.push(chartFullData);
		});
	}

	return allChartData;
}

export function prepareDataForGoogleChartsSplit(sensorsResponse, selectedSensors, type, parMotor){
	//info: parMotor, type
	let allChartData = [];

	let dataToZip = [sensorsResponse['datetimes']];

	selectedSensors.forEach((sensorId) => {
		dataToZip.push(sensorsResponse[sensorId]);
	});

	let chartData = _.zip.apply(_,dataToZip);

	console.log(chartData);

	let reducedChartData = reduceChartPoints(chartData, maxChartPoints);

	let chartFullData = {};

	let title;
	if (type==='infor'){
		title = 'Información general.';
	}
	else if (type==='otro'){
		title = 'Relación entre sensores.';
	}
	else{
		title = 'Búsqueda de anomalías.';
	}
	chartFullData['title'] = title;

	chartFullData['subtitle'] = "";
	selectedSensors.forEach((sensorId, i) => {
		if (i !== (selectedSensors.length - 1)){
			chartFullData['subtitle'] += sensorId + ", ";
		}
		else{
			chartFullData['subtitle'] += sensorId;
		}
	})

	chartFullData['y-axis'] = [];
	selectedSensors.forEach((sensorId, i) => {
			if (parMotor['parMotorId'] && parMotor['parMotorId'] === sensorId && parMotor['calParMotor'] === true){
				chartFullData['y-axis'].push(['ParMotor', 'Par Motor']);
			}
			else{
				var sensor = _.find(infoSensores, ['indicatorId', sensorId]);
				var axisTitle = sensor['observedProperty'];
				var unit = sensor['measureUnit'];
				var axisLabel = axisTitle + " (" + unit + ")"
				var axisData = [axisTitle, axisLabel];
				chartFullData['y-axis'].push(axisData);
			}
	});

	chartFullData['data'] = reducedChartData;

	allChartData.push(chartFullData);

	return allChartData;
}

function getAnomaliasValues(selectedSensors, sensorDir, sensorValues, datetimes, parMotor){
	let anomDatetimes = [];
	let anomValues = {}

	selectedSensors.forEach((sensorId) => {
		if (parMotor['parMotorId'] && parMotor['parMotorId'] === sensorId && parMotor['calParMotor'] === true){
			anomValues[sensorId] = [sensorId + " (Par Motor)"];
		}
		else{
			anomValues[sensorId] = [sensorId];
		}
	});

	let primSensor = selectedSensors[0];
	let restoSensores = selectedSensors.slice(1,selectedSensors.length);
	let prevValues = {};
	sensorValues[primSensor].forEach((value, i) => {
		if (i > 1){
			// console.log("Anteriores: " + JSON.stringify(prevValues));
			// console.log("Actual: " + value);
			var booleans = [];
			if (sensorDir[primSensor] === 'up' && prevValues[primSensor] < value )
				booleans.push(true);
			else if (sensorDir[primSensor] === 'down' && prevValues[primSensor] > value )
				booleans.push(true);
			else if (prevValues[primSensor] !== value)
				booleans.push(false);

			restoSensores.forEach((sensorId) => {
				// console.log("Actual: " + sensorValues[sensorId][i]);
				if (sensorDir[sensorId] === 'up' && prevValues[sensorId] < sensorValues[sensorId][i] )
					booleans.push(true);
				else if (sensorDir[sensorId] === 'down' && prevValues[sensorId] > sensorValues[sensorId][i] )
					booleans.push(true);
				else if (prevValues[sensorId] !== sensorValues[sensorId][i])
					booleans.push(false);
			});
			// console.log(booleans);
			if (!(booleans.every(allTrue) || booleans.every(allFalse))) {
				// console.log('Anomalía detectada');
				anomValues[primSensor].push(value);
				anomDatetimes.push(datetimes[i]);
				restoSensores.forEach((sensorId) => {
					anomValues[sensorId].push(sensorValues[sensorId][i]);
				});
			}
		}
		else{
			// console.log("No hay anomalía");
			// anomValues[primSensor].push(0);
			anomDatetimes.push(datetimes[i]);
			// restoSensores.forEach((sensorId) => {
			// 	anomValues[sensorId].push(0);
			// });
		}
		prevValues[primSensor] = value;
		restoSensores.forEach((sensorId) => {
			prevValues[sensorId] = sensorValues[sensorId][i];
		});
	});

	return {'anomValues':anomValues, 'anomDatetimes':anomDatetimes};
}

// X axis must be Date
function reduceChartPoints(chartData, maxPoints){

	let reducedChartData = [];
	if (chartData.length > maxPoints){
		let valuesToAvg = [];
		chartData[0].forEach((value,i) => {
			valuesToAvg.push([]);
		});
		const sliceLength = Math.ceil(chartData.length / maxPoints) * (chartData[0].length - 1); // * (chartData[0].length - 1)
		chartData.forEach((row, iRow) => {
			if (iRow !== 0){
				if (valuesToAvg[0].length < sliceLength){
					row.forEach((value, iValue) => {
						if (iValue === 0){
							// console.log(value);
							valuesToAvg[iValue].push(value.getTime());
						}
						else{
							valuesToAvg[iValue].push(value);
						}
					});
				}
				else{
					var newRow = [];
					valuesToAvg.forEach((values, iRow) => {
						if (iRow === 0){
							newRow.push(new Date(Math.round(_.mean(values))));
						}
						else{
							newRow.push(_.mean(values));
						}
					});
					reducedChartData.push(newRow);
					let newValuesToAvg = [];
					chartData[0].forEach((value,i) => {
						newValuesToAvg.push([]);
					});
					valuesToAvg = newValuesToAvg.slice();
				}
			}
			else{
				reducedChartData.push(row);
			}
		});

		if (valuesToAvg[0].length > 0){
			var newRow = [];
			valuesToAvg.forEach((values, iRow) => {
				if (iRow === 0){
					newRow.push(new Date(Math.round(_.mean(values))));
				}
				else{
					newRow.push(_.mean(values));
				}
			});
			reducedChartData.push(newRow);
		}
	}
	else{
		reducedChartData = chartData;
	}

	return reducedChartData;
}

function allTrue(value){
	return value === true;
}

function allFalse(value){
	return value === false;
}
