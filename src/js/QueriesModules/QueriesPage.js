// GRANT EXECUTE ON DB.DBA.L_O_LOOK TO "SPARQL";

import React from 'react';
import '../../index.css';
import * as Queries from '../Functions/SPARQLQueries.js';
import {Button, Row, Col, Card, Icon} from 'react-materialize'
import M from 'materialize-css';
import axios from 'axios';
import {GoogleChart} from './GoogleChart.js'
import {PruebaTabsMat} from './SelectQueryTabs.js'
import * as DataFunctions from '../Functions/DataFunctions.js'
import {Chart} from 'react-google-charts';

const _ = require('lodash');
const querystring = require('querystring');

const virtuosoURL = 'http://localhost:8890/sparql';
const RESTfulURLQuery = 'http://localhost:8080/VirtuosoPruebaWeb2/rest/service/query';
const usedURL = virtuosoURL;

const lineChartName = 'Line';
const barChartName = 'Bar';
const scatterChartName = 'Scatter';

// const maxChartPoints = 4500;

const orderBy = {'orderBy':true, 'order':'asc', 'orderField':'dateTime'};

// const infoSensores = require('../../infoSensores.json');
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

export class SensorsInfo extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			selectedSensors: [],
			showQueries: true,
			moreThanOneSensor: false,
			loadingQuery: false,
			showChart: false,
			noDataCharts: [],
			allChartData: null,
			chartType: "ColumnChart",
			longDateFormat: true,
			queryType: '',
			queryInfor: {}
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

		if (!showQueries && !loadingQuery && !showChart){
			this.setState({
				showQueries: true,
			});
		}
		// else if (selectedSensors.length === 0){
		// 	this.setState({
		// 		showQueries: false,
		// 	});
		// }

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
		const sensors = this.props.infoSensores;
		const sensorIcons = sensorIconNames.slice();
		const selectedSensors = this.state.selectedSensors;
		const loadingQuery = this.state.loadingQuery;
		const showChart = this.state.showChart;

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
			const sensor = _.find(this.props.infoSensores, ['indicatorId', value]);
			const sensorName = value + ' (' + sensor.name + ')';
			return(
				<li key={value}>
					{sensorName}
				</li>
			);
		});


		const cardContent = (!loadingQuery && !showChart)
			? (<div>
				<p> Sensores seleccionados: </p>
					<div className='margin-left margin-top'>
						{selectedSensorsNames}
					</div>
				</div>)
			: (<p className='center'>
					Pregunta realizada...
				</p>);

		const cardValue = (selectedSensors.length === 0)
			? (<p className='center'>
					Selecciona uno o varios sensores para realizar preguntas personalizadas.
				</p>)
			: (cardContent);

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

	// getInformationQuery_Old(sensors, groupBy, filter, filterValues){
	// 	console.log("Tiempo inicio " + Date.now());
	// 	let infor = {'sensors': sensors, 'groupBy': groupBy, 'filter': filter, 'filterValues': filterValues};
	//
	// 	let chartType = lineChartName;
	// 	let longDateFormat = true;
	// 	if (groupBy['groupBy']){
	// 		chartType = barChartName;
	// 		longDateFormat = false;
	// 	}
	// 	else if (filter['filter'] && filter['filterTime']){
	// 		chartType = scatterChartName;
	// 	}
	// 	else if (filterValues['filter']) {
	// 		chartType = scatterChartName;
	// 	}
	//
	// 	this.setState({
	// 		showQueries: false,
	// 		loadingQuery: true,
	// 		queryInfor: infor,
	// 		queryType: 'infor',
	// 		chartType: chartType,
	// 		longDateFormat: longDateFormat,
	// 	});
	//
	// 	const querystring = require('querystring');
	// 	let numberOfResponses = 0;
	// 	let sensorsResponse = {};
	//
	// 	// let split = {firstSegment: false, lastTimestamp: '2018-03-18T02:46:40.039Z', limit:10000};
	//
	// 	this.recursiveInforCall_Old(sensors, groupBy, filter, filterValues, numberOfResponses, sensorsResponse, chartType);
	//
	// }

	// recursiveInforCall_Old(selectedSensors, groupBy, filter, filterValues, nResponses, sensorsResponse){
	// 	const querystring = require('querystring');
	// 	var query = Queries.getInformationQueryIndividual(selectedSensors[nResponses], groupBy, filter, filterValues, orderBy);
	// 	// console.log(query);
	// 	axios.post(usedURL,
	// 		querystring.stringify({'query': query})
	// 	)
	// 	.then((response) => {
	// 		console.log(response);
	// 		const sensorId = selectedSensors[nResponses];
	// 		if (response.data["results"]["bindings"].length > 1){
	// 			sensorsResponse[sensorId] = response.data["results"]["bindings"];
	// 		}
	// 		else{
	// 			let noDataCharts = this.state.noDataCharts;
	// 			noDataCharts.push(sensorId);
	// 			this.setState({
	// 				noDataCharts: noDataCharts,
	// 			});
	// 		}
	// 		nResponses++;
	// 		if (nResponses === selectedSensors.length){
	// 			console.log("finalizado!, podemos continuar");
	// 			let allChartData = [];
	// 			if (_.size(sensorsResponse) > 0){
	// 				allChartData = DataFunctions.prepareResponseData(sensorsResponse, {'sensors': selectedSensors, 'groupBy': groupBy, 'filter': filter, 'orderBy': orderBy, 'type': 'infor'}, this.props.infoSensores);
	// 			}
	// 			console.log(allChartData);
	// 			this.setState({
	// 				showChart: true,
	// 				loadingQuery: false,
	// 				allChartData: allChartData,
	// 			});
	// 			// console.log("Tiempo fin " + Date.now());
	// 		}
	// 		else{
	// 			// console.log("New axios call with nResponse: " + nResponses);
	// 			this.recursiveInforCall(selectedSensors, groupBy, filter, filterValues, nResponses, sensorsResponse);
	// 		}
	// 	})
	// 	.catch((error) => {
	// 		console.log(error);
	// 		alert("An error occurred, check the console.log for more info.");
	// 		this.newQuery();
	// 	});
	// }

	getInformationQuery(sensors, groupBy, filter, filterValues){
		console.log("Tiempo inicio " + Date.now());
		let infor = {'sensors': sensors, 'groupBy': groupBy, 'filter': filter, 'filterValues': filterValues};

		let chartType = lineChartName;
		let longDateFormat = true;
		if (groupBy['groupBy']){
			chartType = barChartName;
			longDateFormat = false;
		}
		else if (filter['filter'] && filter['filterTime']){
			chartType = scatterChartName;
		}
		else if (filterValues['filter']) {
			chartType = scatterChartName;
		}

		this.setState({
			showQueries: false,
			loadingQuery: true,
			queryInfor: infor,
			queryType: 'infor',
			chartType: chartType,
			longDateFormat: longDateFormat,
		});

		let numberOfResponses = 0;
		let sensorValues = {};
		let sensorDatetimes = {};

		// let split = {firstSegment: false, lastTimestamp: '2018-03-18T02:46:40.039Z', limit:10000};

		this.recursiveInforCall_New(sensors, groupBy, filter, filterValues, numberOfResponses, sensorValues, sensorDatetimes);
	}

	recursiveInforCall_New(selectedSensors, groupBy, filter, filterValues, nResponses, sensorValues, sensorDatetimes){
		var query = Queries.getInformationQueryIndividual(selectedSensors[nResponses], groupBy, filter, filterValues, orderBy);
		// console.log(query);
		axios.post(usedURL,
			querystring.stringify({'query': query})
		)
		.then((response) => {
			console.log(response);
			const sensorId = selectedSensors[nResponses];
			if (response.data["results"]["bindings"].length > 1){
				// sensorsResponse[sensorId] = response.data["results"]["bindings"];
				// Sustituir y tratar aquí los datos, ponerlos en el formato adecuado y reducirlos
				var result = DataFunctions.parseResponseData(
					response.data["results"]["bindings"],
					sensorId,
					{'sensors': selectedSensors, 'groupBy': groupBy, 'filter': filter, 'orderBy': orderBy, 'type': 'infor', 'parMotor':{}}
				);
				console.log(result);
				sensorValues[sensorId] = result['values'];
				sensorDatetimes[sensorId] = result['datetimes'];
 			}
			else{
				let noDataCharts = this.state.noDataCharts;
				noDataCharts.push(sensorId);
				this.setState({
					noDataCharts: noDataCharts,
				});
			}
			nResponses++;
			if (nResponses === selectedSensors.length){
				console.log("finalizado!, podemos continuar");
				let allChartData = [];
				if (_.size(sensorValues) > 0){
					// allChartData = DataFunctions.prepareResponseData(sensorsResponse, {'sensors': selectedSensors, 'groupBy': groupBy, 'filter': filter, 'orderBy': orderBy, 'type': 'infor'}, this.props.infoSensores);
					// Preparar los datos de la gráfica de Google con los datos ya reducidos.
					allChartData = DataFunctions.prepareGoogleChartsData(
						sensorValues,
						sensorDatetimes,
						selectedSensors,
						{type: 'infor', parMotor:{}, selectedValues: result['selectedValues']},
						this.props.infoSensores
					);
				}
				console.log(allChartData);
				this.setState({
					showChart: true,
					loadingQuery: false,
					allChartData: allChartData,
				});
				console.log("Tiempo fin " + Date.now());
			}
			else{
				// console.log("New axios call with nResponse: " + nResponses);
				this.recursiveInforCall_New(selectedSensors, groupBy, filter, filterValues, nResponses, sensorValues, sensorDatetimes);
			}
		})
		.catch((error) => {
			console.log(error);
			alert("An error occurred, check the console.log for more info.");
			this.newQuery();
		});
	}

	// getInformationQuerySplit(sensors, groupBy, filter, filterValues){
	// 	console.log("Tiempo inicio " + Date.now());
	//
	// 	this.setState({
	// 		showQueries: false,
	// 		loadingQuery: true,
	// 	});
	//
	// 	let chartType = lineChartName;
	// 	if (groupBy['groupBy']){
	// 		chartType = barChartName;
	// 	}
	//
	// 	const querystring = require('querystring');
	// 	let actualSensor = 0;
	// 	let sensorFinished = false;
	//
	// 	let variables = DataFunctions.prepareVariablesSplit(sensors, groupBy, filter, orderBy, 'infor');
	//
	// 	let sensorsResponse = variables['sensorsResponse'];
	//     let selectValue = variables['selectValue'];
	//     let selectDateTime = variables['selectDateTime'];
	//
	// 	console.log(variables);
	//
	// 	let split = {firstSegment: true, lastTimestamp: '', limit:10000};
	//
	// 	this.recursiveInforCallSplit(sensors, groupBy, filter, filterValues, actualSensor, sensorFinished, sensorsResponse, selectValue, selectDateTime, chartType, split);
	// }

	// recursiveInforCallSplit(selectedSensors, groupBy, filter, filterValues, actualSensor, sensorFinished, sensorsResponse, selectValue, selectDateTime, chartType, split){
	// 	const querystring = require('querystring');
	// 	var query = Queries.getInformationQueryIndividualSplit(selectedSensors[actualSensor], groupBy, filter, filterValues, orderBy, split);
	// 	// console.log(query);
	// 	axios.post(usedURL,
	// 		querystring.stringify({'query': query})
	// 	)
	// 	.then((response) => {
	// 		console.log(response);
	// 		const sensorId = selectedSensors[actualSensor];
	// 		let calcDatetimes = false;
	// 		if (actualSensor === 0){
	// 			calcDatetimes = true;
	// 		}
	//
	// 		let parsedResults = DataFunctions.parseSensorValuesSplit(response.data["results"]["bindings"], sensorId, calcDatetimes, selectValue, selectDateTime, {});
	//
	// 		if (parsedResults['values'].length > 0){
	// 			let newResponse = sensorsResponse[sensorId].concat(parsedResults['values']);
	// 			sensorsResponse[sensorId] = newResponse;
	// 			if (calcDatetimes){
	// 				let newDatetimes = sensorsResponse['datetimes'].concat(parsedResults['datetimes']);
	// 				sensorsResponse['datetimes'] = newDatetimes;
	// 			}
	// 		}
	//
	// 		if (parsedResults['values'].length < split['limit']){ //Se ha acabado el sensor
	// 			actualSensor++;
	// 			if (actualSensor < selectedSensors.length){ //Empezar con siguiente sensor
	// 				split['firstSegment'] = true;
	// 				split['lastTimestamp'] = '';
	// 				this.recursiveInforCallSplit(selectedSensors, groupBy, filter, filterValues, actualSensor, sensorFinished, sensorsResponse, selectValue, selectDateTime, chartType, split);
	// 			}
	// 			else{ //Finalizado todo de todos los sensores
	// 				let allChartData = DataFunctions.prepareDataForGoogleChartsSplit(sensorsResponse, selectedSensors, "infor", {}, this.props.infoSensores);
	// 				console.log(allChartData);
	// 				this.setState({
	// 					showChart: true,
	// 					allChartData: allChartData,
	// 					chartType: chartType,
	// 				});
	// 				console.log("Tiempo fin " + Date.now());
	// 			}
	// 		}
	// 		else{ //Seguir con sensor actual
	// 			split['firstSegment'] = false;
	// 			split['lastTimestamp'] = parsedResults['lastTimestamp'];
	// 			// console.log(parsedResults);
	// 			// console.log(split);
	// 			this.recursiveInforCallSplit(selectedSensors, groupBy, filter, filterValues, actualSensor, sensorFinished, sensorsResponse, selectValue, selectDateTime, chartType, split);
	// 		}
	// 	})
	// 	.catch((error) => {
	// 		console.log(error);
	// 		alert("An error occurred, check the console.log for more info.");
	// 		this.newQuery();
	// 	});
	// }

	// getOtherSensorQuery_Old(knownSensors, askedSensors, filterValues, filter){
	// 	let infor =  {'sensors': askedSensors, 'knownSensors': knownSensors, 'filterValues': filterValues, 'filter': filter};
	//
	// 	let chartType = scatterChartName;
	//
	// 	this.setState({
	// 		showQueries: false,
	// 		loadingQuery: true,
	// 		queryInfor: infor,
	// 		queryType: 'otro',
	// 		chartType: chartType,
	// 	});
	//
	// 	const querystring = require('querystring');
	// 	let numberOfResponses = 0;
	// 	let sensorsResponse = {};
	//
	// 	this.recursiveOtroSensorCall_Old(askedSensors, knownSensors, filterValues, filter, numberOfResponses, sensorsResponse);
	// }

	// recursiveOtroSensorCall_Old(askedSensors, knownSensors, filterValues, filter, nResponses, sensorsResponse){
	// 	const querystring = require('querystring');
	// 	var query = Queries.getOtherSensorQueryIndividual(knownSensors, askedSensors[nResponses], filterValues, filter, orderBy);
	// 	axios.post(usedURL,
	// 		querystring.stringify({'query': query})
	// 	)
	// 	.then((response) => {
	// 		console.log(response);
	// 		const sensorId = askedSensors[nResponses];
	// 		if (response.data["results"]["bindings"].length > 1){
	// 			sensorsResponse[sensorId] = response.data["results"]["bindings"];
	// 		}
	// 		else{
	// 			let noDataCharts = this.state.noDataCharts;
	// 			noDataCharts.push(sensorId);
	// 			this.setState({
	// 				noDataCharts: noDataCharts,
	// 			});
	// 		}
	// 		nResponses++;
	// 		if (nResponses === askedSensors.length){
	// 			console.log("finalizado!, podemos continuar");
	// 			let allChartData = [];
	// 			if (_.size(sensorsResponse) > 0){
	// 				allChartData = DataFunctions.prepareResponseData(sensorsResponse, {'sensors': askedSensors, 'type': 'otro'}, this.props.infoSensores);
	// 			}
	// 			console.log(allChartData);
	// 			this.setState({
	// 				showChart: true,
	// 				allChartData: allChartData,
	// 				loadingQuery: false
	// 			});
	// 		}
	// 		else{
	// 			console.log("New axios call with nResponse: " + nResponses);
	// 			this.recursiveOtroSensorCall_Old(askedSensors, knownSensors, filterValues, filter, nResponses, sensorsResponse);
	// 		}
	// 	})
	// 	.catch((error) => {
	// 		console.log(error);
	// 		alert("An error occurred, check the console.log for more info.");
	// 		this.newQuery();
	// 	});
	// }

	getOtherSensorQuery(knownSensors, askedSensors, filterValues, filter){
		console.log("Tiempo inicio " + Date.now());
		let infor =  {'sensors': askedSensors, 'knownSensors': knownSensors, 'filterValues': filterValues, 'filter': filter};

		let chartType = scatterChartName;

		this.setState({
			showQueries: false,
			loadingQuery: true,
			queryInfor: infor,
			queryType: 'otro',
			chartType: chartType,
		});

		const querystring = require('querystring');
		let numberOfResponses = 0;
		let sensorValues = {};
		let sensorDatetimes = {};

		this.recursiveOtroSensorCall_New(askedSensors, knownSensors, filterValues, filter, numberOfResponses, sensorValues, sensorDatetimes);
	}

	recursiveOtroSensorCall_New(askedSensors, knownSensors, filterValues, filter, nResponses, sensorValues, sensorDatetimes){
		var query = Queries.getOtherSensorQueryIndividual(knownSensors, askedSensors[nResponses], filterValues, filter, orderBy);
		axios.post(usedURL,
			querystring.stringify({'query': query})
		)
		.then((response) => {
			console.log(response);
			const sensorId = askedSensors[nResponses];
			if (response.data["results"]["bindings"].length > 1){
				// sensorsResponse[sensorId] = response.data["results"]["bindings"];
				var result = DataFunctions.parseResponseData(
					response.data["results"]["bindings"],
					sensorId,
					{'sensors': askedSensors, 'type': 'otro', 'parMotor':{}}
				);
				console.log(result);
				sensorValues[sensorId] = result['values'];
				sensorDatetimes[sensorId] = result['datetimes'];
			}
			else{
				let noDataCharts = this.state.noDataCharts;
				noDataCharts.push(sensorId);
				this.setState({
					noDataCharts: noDataCharts,
				});
			}
			nResponses++;
			if (nResponses === askedSensors.length){
				console.log("finalizado!, podemos continuar");
				let allChartData = [];
				if (_.size(sensorValues) > 0){
					// allChartData = DataFunctions.prepareResponseData(sensorsResponse, {'sensors': askedSensors, 'type': 'otro'}, this.props.infoSensores);
					allChartData = DataFunctions.prepareGoogleChartsData(
						sensorValues,
						sensorDatetimes,
						askedSensors,
						{type: 'otro', parMotor:{}},
						this.props.infoSensores
					);
				}
				console.log(allChartData);
				this.setState({
					showChart: true,
					allChartData: allChartData,
					loadingQuery: false
				});
				console.log("Tiempo fin " + Date.now());
			}
			else{
				this.recursiveOtroSensorCall_New(askedSensors, knownSensors, filterValues, filter, nResponses, sensorValues, sensorDatetimes);
			}
		})
		.catch((error) => {
			console.log(error);
			alert("An error occurred, check the console.log for more info.");
			this.newQuery();
		});
	}

	// getAnomaliasQuery_Old(sensorsDir, parMotor, filter){
	// 	// const selectedSensors = this.state.selectedSensors.slice();
	// 	let selectedSensors = [];
	// 	_.forEach(sensorsDir, (value, key) => {
	// 		selectedSensors.push(key);
	// 	});
	//
	// 	let infor = {'sensors': selectedSensors, 'sensorsDir':sensorsDir, 'parMotor':parMotor, 'filter':filter};
	//
	// 	let chartType = scatterChartName;
	//
	// 	this.setState({
	// 		showQueries: false,
	// 		loadingQuery: true,
	// 		queryInfor: infor,
	// 		queryType: 'anom',
	// 		chartType: chartType,
	// 	});
	//
	// 	let numberOfResponses = 0;
	// 	let sensorsResponse = {};
	//
	// 	// console.log("First axios call with nResponses: " + numberOfResponses);
	// 	this.recursiveAnomCall_Old(selectedSensors, sensorsDir, parMotor, filter, numberOfResponses, sensorsResponse);
	// }

	// recursiveAnomCall_Old(selectedSensors, sensorsDir, parMotor, filter, nResponses, sensorsResponse){
	// 	const querystring = require('querystring');
	// 	var query = Queries.getInformationQueryIndividual(selectedSensors[nResponses], {}, filter, {}, orderBy);
	// 	axios.post(usedURL,
	// 		querystring.stringify({'query': query})
	// 	)
	// 	.then((response) => {
	// 		console.log(response);
	// 		const sensorId = selectedSensors[nResponses];
	// 		if (response.data["results"]["bindings"].length > 1){
	// 			sensorsResponse[sensorId] = response.data["results"]["bindings"];
	// 		}
	// 		else{
	// 			let noDataCharts = this.state.noDataCharts;
	// 			noDataCharts.push(sensorId);
	// 			this.setState({
	// 				noDataCharts: noDataCharts,
	// 			});
	// 		}
	// 		nResponses++;
	// 		if (nResponses === selectedSensors.length){
	// 			console.log("finalizado!, podemos continuar");
	// 			let allChartData = [];
	// 			if (_.size(sensorsResponse) > 0){
	// 				allChartData = DataFunctions.prepareResponseDataAnomalias(sensorsResponse, selectedSensors, sensorsDir, parMotor, this.props.infoSensores);
	// 			}
	// 			console.log(allChartData);
	// 			if (allChartData.length > 0){
	// 				this.setState({
	// 					showChart: true,
	// 					allChartData: allChartData,
	// 					loadingQuery: false
	// 				});
	// 			}
	// 			else{
	// 				console.log("No hay anomalías");
	// 				this.setState({
	// 					loadingQuery: false,
	// 					// noData: true,
	// 					showChart: true,
	// 					noAnom: true
	// 				});
	// 			}
	// 		}
	// 		else{
	// 			// console.log("New axios call with nResponse: " + nResponses);
	// 			this.recursiveAnomCall_Old(selectedSensors, sensorsDir, parMotor, filter, nResponses, sensorsResponse);
	// 		}
	// 	})
	// 	.catch((error) => {
	// 		console.log(error);
	// 		alert("An error occurred, check the console.log for more info.");
	// 		this.newQuery();
	// 	});
	// }

	getAnomaliasQuery(sensorsDir, parMotor, filter){
		// const selectedSensors = this.state.selectedSensors.slice();
		let selectedSensors = [];
		_.forEach(sensorsDir, (value, key) => {
			selectedSensors.push(key);
		});

		let infor = {'sensors': selectedSensors, 'sensorsDir':sensorsDir, 'parMotor':parMotor, 'filter':filter};

		let chartType = scatterChartName;

		this.setState({
			showQueries: false,
			loadingQuery: true,
			queryInfor: infor,
			queryType: 'anom',
			chartType: chartType,
		});

		let numberOfResponses = 0;
		// let sensorsResponse = {};
		let sensorValues = {};
		let sensorDatetimes = {};

		let sensorsWithData = [];

		// console.log("First axios call with nResponses: " + numberOfResponses);
		this.recursiveAnomCall_New(selectedSensors, sensorsDir, parMotor, filter, numberOfResponses, sensorValues, sensorDatetimes, sensorsWithData);
	}

	recursiveAnomCall_New(selectedSensors, sensorsDir, parMotor, filter, nResponses, sensorValues, sensorDatetimes, sensorsWithData){
		var query = Queries.getInformationQueryIndividual(selectedSensors[nResponses], {}, filter, {}, orderBy);
		axios.post(usedURL,
			querystring.stringify({'query': query})
		)
		.then((response) => {
			console.log(response);
			const sensorId = selectedSensors[nResponses];
			if (response.data["results"]["bindings"].length > 1){
				// sensorsResponse[sensorId] = response.data["results"]["bindings"];
				var result = DataFunctions.parseResponseData(
					response.data["results"]["bindings"],
					sensorId,
					{'sensors': selectedSensors, 'type': 'anom', 'parMotor':parMotor}
				);
				console.log(result);
				sensorValues[sensorId] = result['values'];
				sensorDatetimes[sensorId] = result['datetimes'];
				sensorsWithData.push(sensorId);
			}
			else{
				let noDataCharts = this.state.noDataCharts;
				noDataCharts.push(sensorId);
				this.setState({
					noDataCharts: noDataCharts,
				});
			}
			nResponses++;
			if (nResponses === selectedSensors.length){
				console.log("finalizado!, podemos continuar");
				let allChartData = [];
				if (_.size(sensorValues) > 0){
					// allChartData = DataFunctions.prepareResponseDataAnomalias(sensorsResponse, selectedSensors, sensorsDir, parMotor, this.props.infoSensores);
					let anomResults = DataFunctions.getAnomaliasValues(
						sensorsWithData,
						sensorsDir,
						sensorValues,
						sensorDatetimes,
						parMotor
					);
					allChartData = DataFunctions.prepareGoogleChartsData(
						anomResults['anomValues'],
						anomResults['anomDatetimes'],
						selectedSensors,
						{type:'anom', parMotor:parMotor},
						this.props.infoSensores
					);
				}
				console.log(allChartData);
				if (allChartData.length > 0){
					this.setState({
						showChart: true,
						allChartData: allChartData,
						loadingQuery: false
					});
				}
				else{
					console.log("No hay anomalías");
					this.setState({
						loadingQuery: false,
						// noData: true,
						showChart: true,
						noAnom: true
					});
				}
			}
			else{
				// console.log("New axios call with nResponse: " + nResponses);
				this.recursiveAnomCall_New(selectedSensors, sensorsDir, parMotor, filter, nResponses, sensorValues, sensorDatetimes, sensorsWithData);
			}
		})
		.catch((error) => {
			console.log(error);
			alert("An error occurred, check the console.log for more info.");
			this.newQuery();
		});
	}

	newQuery(){
		const selectedSensors = this.state.selectedSensors.slice();
		// let showQueries = false;
		// if (selectedSensors.length > 0){
		// 	showQueries = true;
		// }
		this.setState({
			showQueries: true,
			loadingQuery: false,
			showChart: false,
			// noData: false,
			noAnom: false,
			noDataCharts: [],
			queryType: '',
			queryInfor: {},
		});
	}

	makeQueryResume(){
		const type = this.state.queryType;
		const info = this.state.queryInfor;
		const showChart = this.state.showChart;
		// const noData = this.state.noData;

		const newQueryButton = (showChart)
			? (<Button className='blue darken-3' onClick={() => {this.newQuery();}}> Nueva pregunta </Button>)
			: (<img className='loading' alt='Cargando...' src={require('../../img/loading_bars.gif')}/>);

		let tipoDePregunta;
		let resumenInfo;

		let sensores;

		if (type === 'infor'){
			let filtroFechas = '', filtroHoras = '', agrupVal = '';
			tipoDePregunta = 'Información sobre los sensores: ';
			sensores = info['sensors'].map((sensorId, i) => {
				const sensor = _.find(this.props.infoSensores, ['indicatorId', sensorId]);
				let filtroValores = '';
				if (info['filterValues']['filter']){ //Hay filtros de valores
					if (info['filterValues']['values'][sensorId]){
						var values = info['filterValues']['values'][sensorId];
						if (values.length > 1){
							filtroValores += ', filtrado entre los valores ' + values[0] + ' y ' + values[1] + '.';
						}
						else{
							filtroValores += ', filtrado para cuando su valor es ' + values[0] + '.';
						}
					}
				}
				const sensorName = sensorId + ' (' + sensor.name + ')' + filtroValores;
				return(
					<li key={sensorId}>
						{sensorName}
					</li>
				);
			});
			if (info['filter']['filter']){ //Hay filtros de fechas y/o horas
				if(info['filter']['filterDate']){ //Hay filtro de fechas
					filtroFechas = 'Entre las fechas ' + info['filter']['startDate'] + ' y ' + info['filter']['endDate'] + '. \n ';
				}
				if(info['filter']['filterTime']){ //Hay filtro de horas
					filtroHoras = 'Entre los tiempos ' + info['filter']['startTime'] + ' y ' + info['filter']['endTime'] + '. \n ';
				}
			}
			if (info['groupBy']['groupBy']){ //Hay agrupaciones de datos
				agrupVal = 'Se mostrará el valor '
				if (info['groupBy']['avg']){ //Agrupados por día
					agrupVal += ' medio ';
				}
				if (info['groupBy']['min']){ //Agrupados por día
					agrupVal += ' mínimo ';
				}
				if (info['groupBy']['max']){ //Agrupados por día
					agrupVal += ' máximo ';
				}
				agrupVal += 'de los sensores '
				if (info['groupBy']['groupByDate']){ //Agrupados por día
					agrupVal += ' agrupados por días, mostrando un valor por día.';
				}
				else if (info['groupBy']['groupByHour']){ //Agrupados por día
					agrupVal += ' agrupados por horas, mostrando un valor por hora.';
				}
				else if (info['groupBy']['groupByAll']){ //Agrupados por día
					agrupVal += ' agrupados en un único valor por cada sensor.';
				}
			}
			resumenInfo = (<div>
								<p>{filtroFechas}</p>
								<p>{filtroHoras}</p>
								<p>{agrupVal}</p>
							</div>);
		}
		else if (type === 'otro'){
			tipoDePregunta = 'Valores de los sensores: ';
			sensores = info['sensors'].map((sensorId, i) => {
				const sensor = _.find(this.props.infoSensores, ['indicatorId', sensorId]);
				const sensorName = sensorId + ' (' + sensor.name + ')';
				return(
					<li key={sensorId}>
						{sensorName}
					</li>
				);
			});
			let sentenceOtros = 'Cuando los siguientes sensores toman estos valores: ';
			let otrosSensores = _.map(info['knownSensors'], (value, sensorId) => {
				const sensor = _.find(this.props.infoSensores, ['indicatorId', sensorId]);
				let filtroValores = '';
				if (info['filterValues']['filter']){ //Hay filtros de valores
					if (info['filterValues']['values'][sensorId]){
						var values = info['filterValues']['values'][sensorId];
						if (values.length > 1){
							filtroValores = ', filtrado entre los valores ' + values[0] + ' y ' + values[1] + '. \n ';
						}
						else{
							filtroValores = ', filtrado para el valor ' + values[0] + '. \n ';
						}
					}
				}
				let finalValue = value;
				if (value === 'min'){
					finalValue = 'su valor mínimo';
				}
				else if (value === 'max'){
					finalValue = 'su valor máximo';
				}
				const sensorName = sensorId + ' (' + sensor.name + '): ' + finalValue + filtroValores;
				return(
					<li key={sensorId}>
						{sensorName}
					</li>
				);
			});
			resumenInfo = (<div>
								<p> {sentenceOtros} </p>
								<div className='margin-left margin-top'>
									 {otrosSensores}
								 </div>
							</div>);
		}
		else { // 'sensorsDir':sensorsDir, 'parMotor':parMotor}
			tipoDePregunta = 'Mostrar los valores de los sensores cuando no siguen esta relación: ';
			resumenInfo = null;
			sensores = _.map(info['sensorsDir'], (value, sensorId) => {
				const sensor = _.find(this.props.infoSensores, ['indicatorId', sensorId]);
				const sensorName = sensorId + ' (' + sensor.name + '): ';
				let icon;
				if (value === 'up'){
					icon = (<Icon>arrow_upward</Icon>);
				}
				else if (value === 'down'){
					icon = (<Icon>arrow_downward</Icon>);
				}
				else if (value === 'on'){
					icon = 'TRUE';
				}
				else if (value === 'off'){
					icon = 'FALSE';
				}
				// const icon = (<Icon>{iconName}</Icon>);
				return(
					<li key={sensorId}>
						{sensorName}
						{icon}
					</li>
				);
			});
		}

		return (
			<Card title='Resumen de la pregunta'>
				<p> {tipoDePregunta} </p>
				<div className='margin-left margin-top'>
					 {sensores}
				 </div>
				<div className='margin-top'>
					 {resumenInfo}
				</div>
				<div className='center margin-top'>
					{newQueryButton}
				</div>
			</Card>
		);
	}

	render(){
		const selectedSensors = this.state.selectedSensors.slice();
		const showQueries = this.state.showQueries;
		const moreThanOneSensor = this.state.moreThanOneSensor;
		const loadingQuery = this.state.loadingQuery;
		const showChart = this.state.showChart;
		const allChartData = this.state.allChartData;
		const chartType = this.state.chartType;
		const longDateFormat = this.state.longDateFormat;
		// const noData = this.state.noData;
		const noDataCharts = this.state.noDataCharts;
		// const queryType = this.state.queryType;
		const noAnom = this.state.noAnom;

		const queriesCardMat = (showQueries)
			? (<PruebaTabsMat
		      		selectedSensors={selectedSensors}
		          	moreThanOneSensor={moreThanOneSensor}
		          	getInformationQuery={(s,g,f,fv) => {this.getInformationQuery(s,g,f,fv);}}
		          	getOtherSensorQuery={(k,a,v,f) => {this.getOtherSensorQuery(k,a,v,f);}}
					getAnomaliasQuery={(s,p,f) => {this.getAnomaliasQuery(s,p,f);}}
					infoSensores={this.props.infoSensores}
		        />)
			: (null);

		const loadingQueryCard = (loadingQuery || showChart)
			&& (this.makeQueryResume());

		// let chartCard = null;
		const loadingChartCard = (loadingQuery) &&
		 	(<Card className='center'>
				<img className='loading' alt='Cargando...'
					src={require('../../img/loading_bars.gif')}
				/>
			</Card>);

		const chartClass = (showChart)
			? ("")
			: ("hidden");

		const noDataInfo = noDataCharts.map((sensorId) => {
			return(
				<p key={sensorId}> No hay datos disponibles del sensor {sensorId}</p>
			);
		});

		const noDataCard = (noDataCharts.length > 0 && showChart) &&
			(<Card className='center red-text'>
				{noDataInfo}
			</Card>);

		const noAnomCard = (noAnom && showChart) &&
			(<Card className='center green-text'>
				No se ha encontrado ninguna anomalía en la relación especificada.
			</Card>);

		// const chartCard =
		// 	(<GoogleChart
		// 		allChartData={allChartData}
		// 		chartType={chartType}
		// 		longDateFormat={longDateFormat}
		// 	/>);

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
					{loadingChartCard}
					{noDataCard}
					{noAnomCard}
					<div className={chartClass}>
						<GoogleChart
							allChartData={allChartData}
							chartType={chartType}
							longDateFormat={longDateFormat}
						/>
					</div>
				</Row>
			</div>
		);
	}
}
