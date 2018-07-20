const maxPoints = 4500;
const _ = require('lodash');

const propertyNames = {
	temperature: 'Temperatura',
	operationState: 'Estado del sensor',
	power: 'Energía',
	rotationalSpeed: 'velocidad de rotación',
	pressure: 'Presión'
}

const unitSymbols = {
	degreeCelsius: '℃',
	ampere: 'A',
	revolutionsPerMinute: 'RPM',
	barUnitOfPressure: 'bar'
}

export function getFormInfo(info){
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

	return {selectedValues: selectedValues, selectedDateTime: selectedDateTime}
}

// Prepare data of the queries
export function parseResponseData(sensorResponse, selectedValues, selectedDateTime, sensorId, info, infoSensores){

	let parsedResults = parseSensorValues(sensorResponse, sensorId, selectedValues, selectedDateTime, info['parMotor'], infoSensores);

	let finalResults;
	if (info['type'] === 'anom' || selectedValues.length > 1){
		finalResults = parsedResults;
	}
	else{
		finalResults = reduceSensorValues(parsedResults['values'], parsedResults['datetimes'], info['sensors']);
	}

    return {'values': finalResults['values'], 'datetimes': finalResults['datetimes'], 'selectedValues': selectedValues};
}

function parseSensorValues(sensorResponse, sensorId, selectValues, selectDateTime, parMotor, infoSensores){
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

	var sensor = _.find(infoSensores, ['indicatorId', sensorId]);
    // --------- Teniendo en cuenta más de un valor agregado ---------
	if (selectValues.length === 1){
		sensorValues = [];
		sensorValues.push(sensor.name);
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
					datetime = new Date(resultDateTimeValue);
				}
				else if (selectDateTime === 'resultHour'){
					var indexFirstSep = resultDateTimeValue.indexOf(':');
					var hour = parseInt(resultDateTimeValue.substring(0,indexFirstSep),10);
					datetime = hour + ":00 - " + (hour + 1) + ":00";
				}
				else {
					datetime = new Date(resultDateTimeValue);
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
					var aux = parseFloat(result[selectValues[0]]["value"]);
					// aux = aux >= 196.4 ? NaN : aux;
					sensorValues.push(aux);
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
				if (!isNaN(value)){
					prevValues.push(value);
				}
				let datetime = datetimes[i].getTime();
				if (!isNaN(datetime)){
					prevDatetimes.push(datetime);
				}
                if (prevDatetimes.length === splitLength){ // hacer la media, introducir, vaciar y seguir
					if (prevValues.length > 0){
						reducedValues.push(_.mean(prevValues));
					}
                    else{
						reducedValues.push(NaN);
					}
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

			var sensor = _.find(infoSensores, ['indicatorId', sensorId]);

			chartFullData['title'] = "Información del sensor: "+ sensor.name;
			chartFullData['subtitle'] = "";
			infoQuery['selectedValues'].forEach((value, i) => {
				if (i === 0){
					if (value === 'minValue'){
						chartFullData['subtitle'] += "Valor mínimo";
					}
					else if (value === 'maxValue'){
						chartFullData['subtitle'] += "Valor máximo";
					}
					else{
						chartFullData['subtitle'] += "Valor medio";
					}
				}
				else{
					if (value === 'minValue'){
						chartFullData['subtitle'] += ", valor mínimo.";
					}
					else if (value === 'maxValue'){
						chartFullData['subtitle'] += ", valor máximo.";
					}
					else{
						chartFullData['subtitle'] += ", valor medio.";
					}
				}
			});

			var property = sensor['observedProperty'];
			var axisLabel;
			if (sensor['measureUnit'] !== ''){
				var unit = sensor['measureUnit'];
				axisLabel = propertyNames[property] + " (" + unitSymbols[unit] + ")";
			}
			else{
				axisLabel = propertyNames[property] + " (Encendido/Apagado)";
			}
			var axisData = [property, axisLabel];
			chartFullData['y-axis'] = [];
			infoQuery['selectedValues'].forEach((value) => {
				chartFullData['y-axis'].push(axisData);
			});

			chartFullData['data'] = chartData;

			allChartData.push(chartFullData);
		});
	}
	else{ // Sólo una gráfica

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
		if (infoQuery['selectedValues'][0] === 'resultValue'){
			selectedSensors.forEach((sensorId, i) => {
				if (i !== (selectedSensors.length - 1)){
					chartFullData['subtitle'] += sensorId + ", ";
				}
				else{
					chartFullData['subtitle'] += sensorId;
				}
			});
		}
		else{
			if (infoQuery['selectedValues'][0] === 'minValue'){
				chartFullData['subtitle'] = "Valor mínimo.";
			}
			else if (infoQuery['selectedValues'][0] === 'maxValue'){
				chartFullData['subtitle'] = "Valor máximo.";
			}
			else{
				chartFullData['subtitle'] = "Valor medio.";
			}
		}

		let properties = [];
		chartFullData['y-axis'] = [];
		selectedSensors.forEach((sensorId, i) => {
				if (infoQuery['parMotor']['parMotorId'] && infoQuery['parMotor']['parMotorId'] === sensorId && infoQuery['parMotor']['calParMotor'] === true){
					chartFullData['y-axis'].push(['ParMotor', 'Par Motor']);
				}
				else{
					var sensor = _.find(infoSensores, ['indicatorId', sensorId]);
					var property = sensor['observedProperty'];
					if (properties.indexOf(property) === -1){
						properties.push(property);
					}
					var axisLabel;
					if (sensor['measureUnit'] !== ''){
						var unit = sensor['measureUnit'];
						axisLabel = propertyNames[property] + " (" + unitSymbols[unit] + ")";
					}
					else{
						axisLabel = propertyNames[property] + " (Encendido/Apagado)";
					}
					var axisData = [property, axisLabel];
					chartFullData['y-axis'].push(axisData);
				}
		});

		var dataToZip = [largestDatetimes];

		selectedSensors.forEach((sensorId) => {
			dataToZip.push(sensorValues[sensorId]);
		});

		if (properties.length === 1 && infoQuery['type']==='infor' && infoQuery['selectedValues'][0] === 'resultValue'){
			let sensorId = selectedSensors[0];
			let actualSensor = _.find(infoSensores, ['indicatorId', sensorId]);
			// let headerMax = 'Outlier superior ' + actualSensor.name;
			// let headerMin = 'Outlier inferior ' + actualSensor.name;
			let outlierMax = ['Outlier superior'];
			let outlierMin = ['Outlier inferior'];
			sensorValues[sensorId].forEach((value) => {
				outlierMax.push(actualSensor.maxValue);
				outlierMin.push(actualSensor.minValue);
			});
			dataToZip.push(outlierMax);
			dataToZip.push(outlierMin);
			let preAxisData = chartFullData['y-axis'][0];
			chartFullData['y-axis'].push(preAxisData);
			chartFullData['y-axis'].push(preAxisData);
		}

		var chartData = _.zip.apply(_,dataToZip);

		console.log(chartData);

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
		if (prevValues[primSensor] && !isNaN(value)){
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
		else if (!prevValues[primSensor] && !isNaN(value)){
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
