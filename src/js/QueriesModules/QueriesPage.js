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
const usedURL = virtuosoURL;

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

		let chartType = "ColumnChart";

		const query = Queries.getInformationQuery(sensors, groupBy, filter, filterValues, orderBy);

		// console.log(query);

		const querystring = require('querystring');
		// console.log(querystring.stringify({'query': query}));
		axios.post(usedURL,
			querystring.stringify({'query': query})
		)
		.then((response) => {
			console.log(response);
			let allChartData = prepareResponseData(response.data, {'sensors': sensors, 'groupBy': groupBy, 'filter': filter, 'orderBy': orderBy, 'type': 'infor'});
			console.log(allChartData);
			this.setState({
				showChart: true,
				allChartData: allChartData,
				chartType: chartType,
			});
			// var file = new Blob([JSON.stringify(response.data)], {type: 'application/json'});
		})
		.catch((error) => {
			console.log(error);
			alert("An error occurred, check the console.log for more info.");
			this.newQuery();
		});

	}

	getOtherSensorQuery(knownSensors, askedSensors, quitarAnomalias){
		this.setState({
			showQueries: false,
			loadingQuery: true,
		});

		let chartType = "ColumnChart";

		const query = Queries.getOtherSensorQuery(knownSensors, askedSensors, quitarAnomalias, orderBy);

		// console.log(query);

		const querystring = require('querystring');
		// console.log(querystring.stringify({'query': query}));
		axios.post(usedURL,
			querystring.stringify({'query': query})
		)
		.then((response) => {
			console.log(response);
			let allChartData = prepareResponseData(response.data, {'sensors': askedSensors, 'type': 'otro'});
			console.log(allChartData);

			// let options = {'title':'Relación entre los valores de los sensores'};

			this.setState({
				showChart: true,
				allChartData: allChartData,
				chartType: chartType,
			});
		})
		.catch((error) => {
			console.log(error);
			alert("An error occurred, check the console.log for more info.");
			this.newQuery();
		});
	}

	getAnomaliasQuery(sensorsDir){
		this.setState({
			showQueries: false,
			loadingQuery: true,
		});

		let chartType = "ScatterChart";

		const selectedSensors = this.state.selectedSensors.slice();

		const query = Queries.getInformationQuery(selectedSensors, {}, {}, {}, orderBy);
		console.log(query);
		// console.log("http://localhost:8080/VirtuosoPruebaWeb2/rest/service/queryGet" + "?query=" + encodeURIComponent(query));
		const querystring = require('querystring');
		axios.post(usedURL,
			querystring.stringify({'query': query})
		)
		.then((response) => {
			console.log(response);
			let allChartData = prepareResponseDataAnomalias(response.data, selectedSensors, sensorsDir);
			console.log(allChartData);
			this.setState({
				showChart: true,
				allChartData: allChartData,
				chartType: chartType,
			});
		})
		.catch((error) => {
			console.log(error);
			alert("An error occurred, check the console.log for more info.");
			this.newQuery();
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
			? (<Button className='blue darken-3' onClick={() => {this.newQuery();}}> Neva pregunta </Button>)
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

function prepareResponseDataAnomalias(response, selectedSensors, sensorDir){
	const results = response["results"]["bindings"];

	let selectValues = ["resultValue"];
	let selectDateTime = ["resultTime"];

	let separateResults = sepResponseInArrays(results, selectedSensors, selectValues, selectDateTime);

	let datetimes = separateResults['datetimes'];
	let sensorValues = separateResults['sensorValues'];

	let anomValuesResult = getAnomaliasValues(selectedSensors, sensorDir, sensorValues, datetimes);

	let anomDatetimes = anomValuesResult['anomDatetimes'];
	let anomValues = anomValuesResult['anomValues'];

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

function prepareDataForGoogleCharts(selectedSensors, selectValues, sensorValues, datetimes){
	let allChartData = [];

	if (selectValues.length === 1){
		let dataToZip = [datetimes];

		selectedSensors.forEach((sensorId) => {
			dataToZip.push(sensorValues[sensorId]);
		})

		let chartData = _.zip.apply(_,dataToZip);

		allChartData.push(chartData);
	}
	else{
		_.forEach(sensorValues, (sensorData, sensorId) =>{
			var dataToZip = [datetimes];

			_.forEach(sensorData, (data, selectHeader) =>{
				dataToZip.push(data);
			});

			var chartData = _.zip.apply(_,dataToZip);

			allChartData.push([sensorId, chartData]);
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
				// anomDatetimes.push(datetimes[i]);
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

function allTrue(value){
	return value === true;
}

function allFalse(value){
	return value === false;
}
