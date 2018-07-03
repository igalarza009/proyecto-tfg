const maxPoints = 4500;
const _ = require('lodash');

// Prepare data of the queries
export function parseResponseData(sensorResponse, sensorId, info){
	// const results = responseData["results"]["bindings"];
	let selectedValues = [];
	let selectedDateTime = '';
	if (info['type'] === 'infor'){
		if (!info['groupBy']['groupByAll']){
			if (info['groupBy']['groupBy']){
				if (info['groupBy']['groupByDate'])
					selectedDateTime = 'resultDate';
				else if (info['groupBy']['groupByHour'])
					selectedDateTime = 'resultHour';

				if (info['groupBy']['avg'])
					selectedValues.push('avgValue');

				if (info['groupBy']['min'])
					selectedValues.push('minValue');

				if (info['groupBy']['max'])
					selectedValues.push('maxValue');
			}
			else {
				selectedValues.push('resultValue');
				selectedDateTime = "resultTime";
			}
		}
	}
	else{
		selectedValues.push('resultValue');
		selectedDateTime = "resultTime";
	}

	let parsedResults = parseSensorValues(sensorResponse, sensorId, selectedValues, selectedDateTime, info['parMotor']);

	let finalResults;
	if (info['type'] === 'anom' || selectedValues.length > 1){
		finalResults = parsedResults;
	}
	else{
		finalResults = reduceSensorValues(parsedResults['values'], parsedResults['datetimes'], info['sensors']);
	}

    return {'values': finalResults['values'], 'datetimes': finalResults['datetimes'], 'selectedValues': selectedValues};
}

function parseSensorValues(sensorResponse, sensorId, selectValues, selectDateTime, parMotor){
    let sensorValues;
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

    // --------- Teniendo en cuenta más de un valor agregado ---------
	if (selectValues.length === 1){
		sensorValues = [];
		sensorValues.push(sensorId);
	}
	else{
		sensorValues = {};
		selectValues.forEach((selectValue) => {
			if (selectValue === 'avgValue'){
				sensorValues[selectValue] = ['Valor medio'];
			}
			else if (selectValue === 'minValue'){
				sensorValues[selectValue] = ['Valor mínimo'];
			}
			else if (selectValue === 'maxValue'){
				sensorValues[selectValue] = ['Valor máximo'];
			}

		});
	}

    // sensorValues.push(sensorId);

		sensorResponse.forEach((result, i) => {
			var sensorNameValue = result["sensorName"]["value"];
			var indexName = sensorNameValue.indexOf('#');
			var sensorId = sensorNameValue.substring(indexName+7);
			if (selectDateTime !== ''){
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
					datetime = new Date(year, monthNumber-1, day, hour, min, sec, milsec);
				}
				datetimes.push(datetime);
			}

            // --------- Teniendo en cuenta más de un valor agregado ---------
			if (selectValues.length === 1){
				if (parMotor['parMotorId'] && parMotor['parMotorId'] === sensorId && parMotor['calParMotor'] === true){ // [79PWN7] * 0.00302) * 3.84
					let parMotorValue = (parseFloat(result[selectValues[0]]["value"]) * 0.00302) * 3.84;
					sensorValues.push(parMotorValue);
				}
				else{
					sensorValues.push(parseFloat(result[selectValues[0]]["value"]));
				}
			}
			else{
				selectValues.forEach((selectValue) => {
			 		sensorValues[selectValue].push(parseFloat(result[selectValue]["value"]));
			 	});
		 	}
		});

	return {'values':sensorValues, 'datetimes':datetimes};
}

function reduceSensorValues(values, datetimes, selectedSensors){
    let reducedValues = [];
    let reducedDatetimes = [];
    if (values.length > (maxPoints / selectedSensors.length)){
        let prevValues = [];
        let prevDatetimes = [];
        const splitLength = Math.ceil(values.length / maxPoints) * selectedSensors.length;
        values.forEach((value, i) => {
            if (i !== 0){
				prevValues.push(value);
				let datetime = datetimes[i].getTime();
				if (!isNaN(datetime)){
					prevDatetimes.push(datetime);
				}
                if (prevValues.length === splitLength){ // hacer la media, introducir, vaciar y seguir
                    reducedValues.push(_.mean(prevValues));
                    reducedDatetimes.push(new Date(Math.round(_.mean(prevDatetimes))));

                    prevValues = [];
                    prevDatetimes = [];
                }
            }
			else{
				reducedValues.push(value);
				reducedDatetimes.push(datetimes[i]);
			}
        });
        if (prevValues.length > 0){
            reducedValues.push(_.mean(prevValues));
            reducedDatetimes.push(new Date(Math.round(_.mean(prevDatetimes))));
        }
    }
    else{
        reducedValues = values;
        reducedDatetimes = datetimes;
    }

    return {'values':reducedValues, 'datetimes': reducedDatetimes};

}

export function prepareGoogleChartsData(sensorValues, sensorDatetimes, selectedSensors, infoQuery, infoSensores){
    let allChartData = [];

	// let dataToZip = [sensorsResponse['datetimes']];
	let largestDatetimes = [];
	// if (type==='anom'){
	// 	largestDatetimes = sensorDatetimes;
	// }
	// else{
		_.forEach(sensorDatetimes, (datetimes, sensorId) => {
			if (largestDatetimes.length < datetimes.length){
				largestDatetimes = datetimes;
			}
		});
	// }

	if (infoQuery['type']==='infor' && infoQuery['selectedValues'].length > 1){ // Más de una gráfica
		_.forEach(sensorValues, (sensorData, sensorId) =>{
			var dataToZip = [largestDatetimes];

			_.forEach(sensorData, (data, selectHeader) =>{
				dataToZip.push(data);
			});

			var chartData = _.zip.apply(_,dataToZip);

			console.log(chartData);

			let chartFullData = {};

			chartFullData['title'] = "Información del sensor: "+ sensorId;

			var sensor = _.find(infoSensores, ['indicatorId', sensorId]);
			var axisTitle = sensor['observedProperty'];
			var unit = sensor['measureUnit'];
			var axisLabel = axisTitle + " (" + unit + ")"
			var axisData = [axisTitle, axisLabel];
			chartFullData['y-axis'] = [];
			infoQuery['selectedValues'].forEach((value) => {
				chartFullData['y-axis'].push(axisData);
			});

			chartFullData['data'] = chartData;

			allChartData.push(chartFullData);
		});
	}
	else{ // Sólo una gráfica
		var dataToZip = [largestDatetimes];

		selectedSensors.forEach((sensorId) => {
			dataToZip.push(sensorValues[sensorId]);
		});

		var chartData = _.zip.apply(_,dataToZip);

		console.log(chartData);

		// let reducedChartData = reduceChartPoints(chartData, maxChartPoints);

		var chartFullData = {};

		var title;
		if (infoQuery['type']==='infor'){
			title = 'Información general.';
		}
		else if (infoQuery['type']==='otro'){
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
				if (infoQuery['parMotor']['parMotorId'] && infoQuery['parMotor']['parMotorId'] === sensorId && infoQuery['parMotor']['calParMotor'] === true){
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

		chartFullData['data'] = chartData;

		allChartData.push(chartFullData);
	}

	return allChartData;
}

export function getAnomaliasValues(selectedSensors, sensorDir, sensorValues, sensorDatetimes, parMotor){
	let anomDatetimes = [];
	let anomValues = {}

	const datetimes = sensorDatetimes[selectedSensors[0]];

	selectedSensors.forEach((sensorId) => {
		if (parMotor['parMotorId'] && parMotor['parMotorId'] === sensorId && parMotor['calParMotor'] === true){
			anomValues[sensorId] = [sensorId + " (Par Motor)"];
		}
		else{
			anomValues[sensorId] = [sensorId];
		}
	});

	anomDatetimes.push(datetimes[0]);

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
		if (i !== 0){
			prevValues[primSensor] = value;
			restoSensores.forEach((sensorId) => {
				prevValues[sensorId] = sensorValues[sensorId][i];
			});
		}
	});

	let reducedAnomResults = {};
	let reducedAnomDatetimes = {};

	selectedSensors.forEach((sensorId) => {
		var reducedResults = reduceSensorValues(anomValues[sensorId], datetimes, selectedSensors);
		reducedAnomResults[sensorId] = reducedResults['values'];
		reducedAnomDatetimes[sensorId] = reducedResults['datetimes'];
	});

	return {'anomValues':reducedAnomResults, 'anomDatetimes':reducedAnomDatetimes};
}

function allTrue(value){
	return value === true;
}

function allFalse(value){
	return value === false;
}
