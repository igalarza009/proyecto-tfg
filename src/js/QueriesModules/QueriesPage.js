import React from 'react';
import '../../index.css';
import * as Queries from './SPARQLQueries.js';
import {Button, Row, Col, Card} from 'react-materialize'
import M from 'materialize-css';
import axios from 'axios';
import {GoogleChart} from './GoogleChart.js'
import {PruebaTabsMat} from './SelectQueryTabs.js'

var _ = require('lodash');

const infoSensores = require('../../infoSensores.json');
const sensorIconNames = ['tempIcon', 'resistIcon', 'ventIcon', 'rpmIcon', 'consumoIcon', 'presionIcon', 'tempFundidoIcon'];
const sensorIconTooltips = {
	'tempIcon':'Temperatura',
	'resistIcon':'Resistencia',
	'ventIcon':'Ventilación',
	'rpmIcon':'R.P.M. husillo',
	'consumoIcon':'Consumo del motor',
	'presionIcon':'Presión',
	'tempFundidoIcon':'Temperatura de fundido'
};

const virtuosoURL = 'http://localhost:8890/sparql';
const RESTfulURLQuery = 'http://localhost:8080/VirtuosoPruebaWeb2/rest/service/query';
const usedURL = RESTfulURLQuery;

const orderBy = {'orderBy':true, 'order':'asc', 'orderField':'dateTime'};

export class SensorsInfo extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			selectedSensors: [],
			showQueries: false,
			moreThanOneSensor: false,
			loadingQuery: false,
			showChart: false,
			allChartData: null,
			chartType: "ColumnChart"
		};
	}

	toggleSelectedSensor(sensor){
		const selectedSensors = this.state.selectedSensors.slice();
		const sensorIndex = selectedSensors.indexOf(sensor);
		const showQueries = this.state.showQueries;
		const moreThanOneSensor = this.state.moreThanOneSensor;
		const loadingQuery = this.state.loadingQuery;
		const showChart = this.state.showChart;

		if (sensorIndex < 0)
			selectedSensors.push(sensor);
		else
			selectedSensors.splice(sensorIndex, 1);

		this.setState({
			selectedSensors: selectedSensors,
		});

		if (selectedSensors.length > 0 && !showQueries && !loadingQuery && !showChart){
			this.setState({
				showQueries: true,
			});
		}
		else if (selectedSensors.length === 0){
			this.setState({
				showQueries: false,
			});
		}

		if (selectedSensors.length > 1 && !moreThanOneSensor){
			this.setState({
				moreThanOneSensor: true,
			});
		}
		else if (selectedSensors.length <= 1){
			this.setState({
				moreThanOneSensor: false,
			});
		}

	}

	renderSensorMap(){
		const sensors = infoSensores.slice();
		const sensorIcons = sensorIconNames.slice();
		const selectedSensors = this.state.selectedSensors;

		const sensorDivs = sensors.map((value) => {
			const sensorId = value.indicatorId;
			const sensorClass = value.class;
			const sensorIndex = selectedSensors.indexOf(sensorId);
			let classes;
			if (sensorIndex < 0)
				classes = 'sensorDiv z-depth-1 ' + sensorClass;
			else
				classes = 'sensorDivSelected z-depth-1 ' + sensorClass;

			return(
				<div key={sensorId} className={classes}
					onClick={() => this.toggleSelectedSensor(sensorId)}>
				</div>
			);
		});

		const iconDivs = sensorIcons.map((iconName) => {
			const classes = 'iconDiv tooltipped ' + iconName;
			const tooltipName = sensorIconTooltips[iconName];
			return(
				<div key={classes} className={classes} data-position="top"
					data-delay="10" data-tooltip={tooltipName}
				>
					<img alt={iconName} src={require('../../img/'+iconName+'.png')}/>
				</div>
			);
		});

		const selectedSensorsNames = selectedSensors.map((value) => {
			const sensor = _.find(infoSensores, ['indicatorId', value]);
			const sensorName = value + ' (' + sensor.name + ')';
			return(
				<li key={value}>
					{sensorName}
				</li>
			);
		});

		const cardValue = (selectedSensors.length === 0)
			? (<p className='center'>
					Selecciona el sensor o sensores deseados
				</p>)
			: (<div>
					<p> Sensores seleccionados: </p>
					<div className='margin-left margin-top'>
						{selectedSensorsNames}
					</div>
				</div>);

		return(
			<Card header={
				<div className='mapContainer'>
					<img alt='Mapa de sensores'
						src={require('../../img/extrusora_editada_grande_claro.png')}
					/>
					{iconDivs}
					{sensorDivs}
				</div>} >
				{cardValue}
			</Card>
		)
	}

	getInformationQuery(sensors, groupBy, filter, filterValues){
		this.setState({
			showQueries: false,
			loadingQuery: true,
		});

		let chartType = "Line";
		if (groupBy['groupBy']){
			chartType = "Bar";
		}

		// const query = Queries.getInformationQuery(sensors, groupBy, filter, filterValues, orderBy);
		//
		// // console.log(query);
		//
		// const querystring = require('querystring');
		// // console.log(querystring.stringify({'query': query}));
		// axios.post(usedURL,
		// 	querystring.stringify({'query': query})
		// )
		// .then((response) => {
		// 	console.log(response);
		// 	let allChartData = prepareResponseData(response.data, {'sensors': sensors, 'groupBy': groupBy, 'filter': filter, 'orderBy': orderBy, 'type': 'infor'});
		// 	console.log(allChartData);
		// 	// this.setState({
		// 	// 	showChart: true,
		// 	// 	allChartData: allChartData,
		// 	// 	chartType: chartType,
		// 	// });
		// 	// var file = new Blob([JSON.stringify(response.data)], {type: 'application/json'});
		// })
		// .catch((error) => {
		// 	console.log(error);
		// 	alert("An error occurred, check the console.log for more info.");
		// 	this.newQuery();
		// });

		const querystring = require('querystring');
		let numberOfResponses = 0;
		let sensorsResponse = {};

		sensors.forEach((sensorId) => {
			var query = Queries.getInformationQueryIndividual(sensorId, groupBy, filter, filterValues, orderBy);
			// console.log(query);
			axios.post(usedURL,
				querystring.stringify({'query': query})
			)
			.then((response) => {
				console.log(response);
				sensorsResponse[sensorId] = response.data["results"]["bindings"];
				numberOfResponses++;
				if (numberOfResponses === sensors.length){
					console.log("finalizado!, podemos continuar");
					console.log(sensorsResponse);
					let allChartData = prepareResponseDataIndividual(sensorsResponse, {'sensors': sensors, 'groupBy': groupBy, 'filter': filter, 'orderBy': orderBy, 'type': 'infor'});
					this.setState({
						showChart: true,
						allChartData: allChartData,
						chartType: chartType,
					});
				}
			})
			.catch((error) => {
				console.log(error);
				alert("An error occurred, check the console.log for more info.");
				this.newQuery();
			});
		});

	}

	getOtherSensorQuery(knownSensors, askedSensors, quitarAnomalias){
		this.setState({
			showQueries: false,
			loadingQuery: true,
		});

		let chartType = "ColumnChart";

		// const query = Queries.getOtherSensorQuery(knownSensors, askedSensors, quitarAnomalias, orderBy);
		//
		// // console.log(query);
		//
		// const querystring = require('querystring');
		// // console.log(querystring.stringify({'query': query}));
		// axios.post(usedURL,
		// 	querystring.stringify({'query': query})
		// )
		// .then((response) => {
		// 	console.log(response);
		// 	let allChartData = prepareResponseData(response.data, {'sensors': askedSensors, 'type': 'otro'});
		// 	console.log(allChartData);
		//
		// 	// let options = {'title':'Relación entre los valores de los sensores'};
		//
		// 	this.setState({
		// 		showChart: true,
		// 		allChartData: allChartData,
		// 		chartType: chartType,
		// 	});
		// })
		// .catch((error) => {
		// 	console.log(error);
		// 	alert("An error occurred, check the console.log for more info.");
		// 	this.newQuery();
		// });
		const querystring = require('querystring');
		let numberOfResponses = 0;
		let sensorsResponse = {};

		askedSensors.forEach((sensorId) => {
			var query = Queries.getOtherSensorQueryIndividual(knownSensors, sensorId, quitarAnomalias, orderBy);
			// console.log(query);
			axios.post(usedURL,
				querystring.stringify({'query': query})
			)
			.then((response) => {
				console.log(response);
				sensorsResponse[sensorId] = response.data["results"]["bindings"];
				numberOfResponses++;
				if (numberOfResponses === askedSensors.length){
					console.log("finalizado!, podemos continuar");
					let allChartData = prepareResponseDataIndividual(sensorsResponse, {'sensors': askedSensors, 'type': 'otro'});
					console.log(sensorsResponse);
					this.setState({
						showChart: true,
						allChartData: allChartData,
						chartType: chartType,
					});
				}
			})
			.catch((error) => {
				console.log(error);
				alert("An error occurred, check the console.log for more info.");
				this.newQuery();
			});
		});

	}

	getAnomaliasQuery(sensorsDir){
		this.setState({
			showQueries: false,
			loadingQuery: true,
		});

		let chartType = "ScatterChart";

		const selectedSensors = this.state.selectedSensors.slice();

		// const query = Queries.getInformationQuery(selectedSensors, {}, {}, {}, orderBy);
		// // console.log(query);
		// // console.log("http://localhost:8080/VirtuosoPruebaWeb2/rest/service/queryGet" + "?query=" + encodeURIComponent(query));
		// const querystring = require('querystring');
		// axios.post(usedURL,
		// 	querystring.stringify({'query': query})
		// )
		// .then((response) => {
		// 	console.log(response);
		// 	let allChartData = prepareResponseDataAnomalias(response.data, selectedSensors, sensorsDir);
		// 	console.log(allChartData);
		// 	// this.setState({
		// 	// 	showChart: true,
		// 	// 	allChartData: allChartData,
		// 	// 	chartType: chartType,
		// 	// });
		// })
		// .catch((error) => {
		// 	console.log(error);
		// 	alert("An error occurred, check the console.log for more info.");
		// 	this.newQuery();
		// });

		const querystring = require('querystring');
		let numberOfResponses = 0;
		let sensorsResponse = {};


		selectedSensors.forEach((sensorId) => {
			var query = Queries.getInformationQueryIndividual(sensorId, {}, {}, {}, orderBy);
			axios.post(usedURL,
				querystring.stringify({'query': query})
			)
			.then((response) => {
				console.log(response);
				sensorsResponse[sensorId] = response.data["results"]["bindings"];
				numberOfResponses++;
				if (numberOfResponses === selectedSensors.length){
					console.log("finalizado!, podemos continuar");
					let allChartData = prepareResponseDataAnomalias(sensorsResponse, selectedSensors, sensorsDir);
					console.log(sensorsResponse);
					this.setState({
						showChart: true,
						allChartData: allChartData,
						chartType: chartType,
					});
				}
			})
			.catch((error) => {
				console.log(error);
				alert("An error occurred, check the console.log for more info.");
				this.newQuery();
			});
		});

	}

	newQuery(){
		const selectedSensors = this.state.selectedSensors.slice();
		let showQueries = false;
		if (selectedSensors.length > 0){
			showQueries = true;
		}
		this.setState({
			showQueries: showQueries,
			loadingQuery: false,
			showChart: false,
		});
	}

	// makeQueryResume(){
	// 	if (info['type'] === 'infor'){
	// 	}
	// 	else if (info['type'] === 'otro'){
	// 	}
	// 	return (
	// 		<Card title='Resumen de la pregunta'>
	// 		</Card>
	// 	);
	// }

	render(){
		const selectedSensors = this.state.selectedSensors.slice();
		const showQueries = this.state.showQueries;
		const moreThanOneSensor = this.state.moreThanOneSensor;
		const loadingQuery = this.state.loadingQuery;
		const showChart = this.state.showChart;
		const allChartData = this.state.allChartData;
		const chartType = this.state.chartType;

		const queriesCardMat = (showQueries)
			? (<PruebaTabsMat
		      		selectedSensors={selectedSensors}
		          	moreThanOneSensor={moreThanOneSensor}
		          	getInformationQuery={(s,g,f,fv) => {this.getInformationQuery(s,g,f,fv);}}
		          	getOtherSensorQuery={(k,a,q) => {this.getOtherSensorQuery(k,a,q);}}
					getAnomaliasQuery={(s) => {this.getAnomaliasQuery(s);}}
		        />)
			: (null);

		const newQueryButton = (showChart)
			? (<Button className='blue darken-3' onClick={() => {this.newQuery();}}> Nueva pregunta </Button>)
			: (<img className='loading' alt='Cargando...' src={require('../../img/loading_bars.gif')}/>);

		const loadingQueryCard = (loadingQuery)
			? (<Card className='center valign-wrapper' title='Resumen de la pregunta'>
					<p> ... resumen de la pregunta realizada ... </p>
					<br/>
					{newQueryButton}
				</Card>)
			: (null)

		let chartCard = null;
		if (loadingQuery){
			chartCard = <Card className='center'>
							<img className='loading' alt='Cargando...'
								src={require('../../img/loading_bars.gif')}
							/>
						</Card>;
		}
		if (showChart){
			chartCard = <GoogleChart
							allChartData={allChartData}
							chartType={chartType}
						/>;
		}

		return(
			<div className='sensorsInfo'>
				<Row>
					<Col s={12} m={6} l={5}>
						<div className='sensorMap'>
							{this.renderSensorMap()}
						</div>
					</Col>
					<Col s={12} m={6} l={7}>
						{queriesCardMat}
						{loadingQueryCard}
					</Col>
				</Row>
				<Row s={12}>
					{chartCard}
				</Row>
			</div>
		);
	}
}

// info: (sensors, groupBy, filter, orderBy, type)
function prepareResponseData(responseData, info){
	const results = responseData["results"]["bindings"];
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

	let separateResults = sepResponseInArrays(results, info['sensors'], selectedValues, selectDateTime);

	let sensorValues = separateResults['sensorValues'];
	let datetimes = separateResults['datetimes'];

	let allChartData = prepareDataForGoogleCharts(info['sensors'], selectedValues, sensorValues, datetimes);

	return allChartData;
}

function prepareResponseDataIndividual(sensorsResponse, info){
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

	let separateResults = parseSensorValues(sensorsResponse, info['sensors'], selectedValues, selectDateTime);

	let sensorValues = separateResults['sensorValues'];
	let datetimes = separateResults['datetimes'];

	let allChartData = prepareDataForGoogleCharts(info['sensors'], selectedValues, sensorValues, datetimes);

	return allChartData;
}

function prepareResponseDataAnomalias(results, selectedSensors, sensorDir){
	// const results = response["results"]["bindings"];

	let selectValues = ["resultValue"];
	let selectDateTime = "resultTime";

	let separateResults = parseSensorValues(results, selectedSensors, selectValues, selectDateTime);

	let datetimes = separateResults['datetimes'];
	let sensorValues = separateResults['sensorValues'];

	console.log(datetimes);
	console.log(sensorValues);

	let anomValuesResult = getAnomaliasValues(selectedSensors, sensorDir, sensorValues, datetimes);

	let anomDatetimes = anomValuesResult['anomDatetimes'];
	let anomValues = anomValuesResult['anomValues'];

	console.log(anomDatetimes);
	console.log(anomValues);

	let allChartData = prepareDataForGoogleCharts(selectedSensors, selectValues, anomValues, anomDatetimes);

	return allChartData;
}

function sepResponseInArrays(results, selectedSensors, selectValues, selectDateTime){
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

	results.forEach((result) => {
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
				// var indexFirstSep = resultDateTimeValue.indexOf(':');
				// var hour = parseInt(resultDateTimeValue.substring(0,indexFirstSep),10);
				// var min = parseInt(resultDateTimeValue.substring(indexFirstSep+1, indexFirstSep+3), 10);
				// var sec = parseInt(resultDateTimeValue.substring(indexFirstSep+4,indexFirstSep+6),10);
				// var milsec = parseInt(resultDateTimeValue.substring(indexFirstSep+7,indexFirstSep+10),10);
				datetime = resultDateTimeValue.substring(0,5);
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
			sensorValuesSep[sensorId].push(parseFloat(result[selectValues[0]]["value"]));
		}
		else{
			selectValues.forEach((selectValue) => {
				sensorValuesSep[sensorId][selectValue].push(parseFloat(result[selectValue]["value"]));
			});
		}
	});

	let returnValue = {'sensorValues':sensorValuesSep, 'datetimes':datetimes };

	return returnValue;
}

function parseSensorValues(sensorsResponse, selectedSensors, selectValues, selectDateTime){
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
					// var indexFirstSep = resultDateTimeValue.indexOf(':');
					// var hour = parseInt(resultDateTimeValue.substring(0,indexFirstSep),10);
					// var min = parseInt(resultDateTimeValue.substring(indexFirstSep+1, indexFirstSep+3), 10);
					// var sec = parseInt(resultDateTimeValue.substring(indexFirstSep+4,indexFirstSep+6),10);
					// var milsec = parseInt(resultDateTimeValue.substring(indexFirstSep+7,indexFirstSep+10),10);
					datetime = resultDateTimeValue.substring(0,5);
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
				sensorValuesSep[sensorId].push(parseFloat(result[selectValues[0]]["value"]));
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

function prepareDataForGoogleCharts(selectedSensors, selectValues, sensorValues, datetimes){
	let allChartData = [];

	if (selectValues.length === 1){
		let dataToZip = [datetimes];

		selectedSensors.forEach((sensorId) => {
			dataToZip.push(sensorValues[sensorId]);
		});

		let chartData = _.zip.apply(_,dataToZip);

		console.log(chartData);

		let reducedChartData = reduceChartPoints(chartData, 2000);

		let chartFullData = {};

		chartFullData['title'] = "---Tipo pregunta---: ";
		selectedSensors.forEach((sensorId, i) => {
			if (i !== selectedSensors.length){
				chartFullData['title'] += sensorId + ", ";
			}
			else{
				chartFullData['title'] += sensorId;
			}
		})

		chartFullData['y-axis'] = [];
		reducedChartData[0].forEach((rowValue, i) => {
			if (i !== 0){
				var sensor = _.find(infoSensores, ['indicatorId', rowValue]);
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
		_.forEach(sensorValues, (sensorData, sensorId) =>{
			var dataToZip = [datetimes];

			_.forEach(sensorData, (data, selectHeader) =>{
				dataToZip.push(data);
			});

			var chartData = _.zip.apply(_,dataToZip);

			console.log(chartData);

			let reducedChartData = reduceChartPoints(chartData, 2000);

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

function getAnomaliasValues(selectedSensors, sensorDir, sensorValues, datetimes){
	let anomDatetimes = [];
	let anomValues = {}

	selectedSensors.forEach((sensorId) => {
		anomValues[sensorId] = [sensorId];
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
			else{
				// console.log("No hay anomalía");
				// anomValues[primSensor].push(0);
				anomDatetimes.push(datetimes[i]);
				// restoSensores.forEach((sensorId) => {
				// 	anomValues[sensorId].push(0);
				// });
			}
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
		const sliceLength = Math.ceil(chartData.length / maxPoints);
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

// 	let reducedValues = {};
// 	selectedSensors.forEach((sensorId) => {
// 		reducedValues[sensorId] = [];
// 	});
// 	let reducedDatetimes = [];
//
// 	let primSensorId = selectedSensors[0];
// 	if (sensorValues[primSensorId].length > 2000){
// 		let redMax = Math.round(sensorValues[primSensorId].length / 2000);
// 		let valuesToAvg = {};
// 		selectedSensors.forEach((sensorId) => {
// 			valuesToAvg[sensorId] = [];
// 		});
// 		let timesToAvg = [];
// 		sensorValues[primSensorId].forEach((value, i) => {
// 			if (i!==0){
// 				if (valuesToAvg[primSensorId].length < redMax){
// 					// valuestoAvg[primSensorId].push(value);
// 					selectedSensors.forEach((sensorId) => {
// 						valuesToAvg[primSensorId].push(sensorValues[sensorId][i]);
// 					});
// 					if (valuesToAvg[primSensorId].length === 1){
// 						timesToAvg.push(datetimes[i].getTime());
// 					}
// 					else if (valuesToAvg[primSensorId].length === redMax){
// 						timesToAvg.push(datetimes[i].getTime());
// 					}
// 				}
// 				else{
// 					// reducedValues[primSensorId].push(_.mean(valuesToAvg[primSensorId]));
// 					selectedSensors.forEach((sensorId) => {
// 						reducedValues[sensorId].push(_.mean(valuesToAvg[sensorId]));
// 					});
// 					reducedDatetimes.push(new Date( Math.round(_.mean(timesToAvg))));
// 					selectedSensors.forEach((sensorId) => {
// 						valuesToAvg[sensorId] = [];
// 					});
// 					timesToAvg = [];
// 				}
// 			}
// 			else{
// 				selectedSensors.forEach((sensorId) => {
// 					reducedValues[sensorId].push(sensorValues[sensorId][i]);
// 				});
// 				reducedDatetimes.push(datetimes[i]);
// 			}
// 		});
//
// 		console.log(reducedValues);
// 		console.log(reducedDatetimes);
// 	}
