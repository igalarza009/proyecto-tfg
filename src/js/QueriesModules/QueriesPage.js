import React from 'react';
import '../../index.css';
import * as Queries from './SPARQLQueries.js';
import {Button, Row, Col, Card, Icon} from 'react-materialize'
import M from 'materialize-css';
import axios from 'axios';
import {GoogleChart} from './GoogleChart.js'
import {PruebaTabsMat} from './SelectQueryTabs.js'
import * as DataFunctions from './DataFunctions.js'

var _ = require('lodash');

const virtuosoURL = 'http://localhost:8890/sparql';
const RESTfulURLQuery = 'http://localhost:8080/VirtuosoPruebaWeb2/rest/service/query';
const usedURL = RESTfulURLQuery;

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
			showQueries: false,
			moreThanOneSensor: false,
			loadingQuery: false,
			showChart: false,
			allChartData: null,
			chartType: "ColumnChart",
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
					Selecciona el sensor o sensores deseados
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

	getInformationQuery(sensors, groupBy, filter, filterValues){
		console.log("Tiempo inicio " + Date.now());
		let infor = {'sensors': sensors, 'groupBy': groupBy, 'filter': filter, 'filterValues': filterValues};
		this.setState({
			showQueries: false,
			loadingQuery: true,
			queryInfor: infor,
			queryType: 'infor',
		});

		let chartType = lineChartName;
		if (groupBy['groupBy']){
			chartType = barChartName;
		}

		const querystring = require('querystring');
		let numberOfResponses = 0;
		let sensorsResponse = {};

		// let split = {firstSegment: false, lastTimestamp: '2018-03-18T02:46:40.039Z', limit:10000};

		this.recursiveInforCall(sensors, groupBy, filter, filterValues, numberOfResponses, sensorsResponse, chartType);

	}

	recursiveInforCall(selectedSensors, groupBy, filter, filterValues, nResponses, sensorsResponse, chartType){
		const querystring = require('querystring');
		var query = Queries.getInformationQueryIndividual(selectedSensors[nResponses], groupBy, filter, filterValues, orderBy);
		axios.post(usedURL,
			querystring.stringify({'query': query})
		)
		.then((response) => {
			console.log(response);
			const sensorId = selectedSensors[nResponses];
			sensorsResponse[sensorId] = response.data["results"]["bindings"];
			nResponses++;
			if (nResponses === selectedSensors.length){
				console.log("finalizado!, podemos continuar");
				let allChartData = DataFunctions.prepareResponseDataIndividual(sensorsResponse, {'sensors': selectedSensors, 'groupBy': groupBy, 'filter': filter, 'orderBy': orderBy, 'type': 'infor'}, this.props.infoSensores);
				console.log(allChartData);
				this.setState({
					showChart: true,
					allChartData: allChartData,
					chartType: chartType,
				});
				console.log("Tiempo fin " + Date.now());
			}
			else{
				console.log("New axios call with nResponse: " + nResponses);
				this.recursiveInforCall(selectedSensors, groupBy, filter, filterValues, nResponses, sensorsResponse, chartType);
			}
		})
		.catch((error) => {
			console.log(error);
			alert("An error occurred, check the console.log for more info.");
			this.newQuery();
		});
	}

	getInformationQuerySplit(sensors, groupBy, filter, filterValues){
		console.log("Tiempo inicio " + Date.now());

		this.setState({
			showQueries: false,
			loadingQuery: true,
		});

		let chartType = lineChartName;
		if (groupBy['groupBy']){
			chartType = barChartName;
		}

		const querystring = require('querystring');
		let actualSensor = 0;
		let sensorFinished = false;

		let variables = DataFunctions.prepareVariablesSplit(sensors, groupBy, filter, orderBy, 'infor');

		let sensorsResponse = variables['sensorsResponse'];
	    let selectValue = variables['selectValue'];
	    let selectDateTime = variables['selectDateTime'];

		console.log(variables);

		let split = {firstSegment: true, lastTimestamp: '', limit:10000};

		this.recursiveInforCallSplit(sensors, groupBy, filter, filterValues, actualSensor, sensorFinished, sensorsResponse, selectValue, selectDateTime, chartType, split);
	}

	recursiveInforCallSplit(selectedSensors, groupBy, filter, filterValues, actualSensor, sensorFinished, sensorsResponse, selectValue, selectDateTime, chartType, split){
		const querystring = require('querystring');
		var query = Queries.getInformationQueryIndividualSplit(selectedSensors[actualSensor], groupBy, filter, filterValues, orderBy, split);
		// console.log(query);
		axios.post(usedURL,
			querystring.stringify({'query': query})
		)
		.then((response) => {
			console.log(response);
			const sensorId = selectedSensors[actualSensor];
			let calcDatetimes = false;
			if (actualSensor === 0){
				calcDatetimes = true;
			}

			let parsedResults = DataFunctions.parseSensorValuesSplit(response.data["results"]["bindings"], sensorId, calcDatetimes, selectValue, selectDateTime, {});

			if (parsedResults['values'].length > 0){
				let newResponse = sensorsResponse[sensorId].concat(parsedResults['values']);
				sensorsResponse[sensorId] = newResponse;
				if (calcDatetimes){
					let newDatetimes = sensorsResponse['datetimes'].concat(parsedResults['datetimes']);
					sensorsResponse['datetimes'] = newDatetimes;
				}
			}

			if (parsedResults['values'].length < split['limit']){ //Se ha acabado el sensor
				actualSensor++;
				if (actualSensor < selectedSensors.length){ //Empezar con siguiente sensor
					split['firstSegment'] = true;
					split['lastTimestamp'] = '';
					this.recursiveInforCallSplit(selectedSensors, groupBy, filter, filterValues, actualSensor, sensorFinished, sensorsResponse, selectValue, selectDateTime, chartType, split);
				}
				else{ //Finalizado todo de todos los sensores
					let allChartData = DataFunctions.prepareDataForGoogleChartsSplit(sensorsResponse, selectedSensors, "infor", {}, this.props.infoSensores);
					console.log(allChartData);
					this.setState({
						showChart: true,
						allChartData: allChartData,
						chartType: chartType,
					});
					console.log("Tiempo fin " + Date.now());
				}
			}
			else{ //Seguir con sensor actual
				split['firstSegment'] = false;
				split['lastTimestamp'] = parsedResults['lastTimestamp'];
				// console.log(parsedResults);
				// console.log(split);
				this.recursiveInforCallSplit(selectedSensors, groupBy, filter, filterValues, actualSensor, sensorFinished, sensorsResponse, selectValue, selectDateTime, chartType, split);
			}
		})
		.catch((error) => {
			console.log(error);
			alert("An error occurred, check the console.log for more info.");
			this.newQuery();
		});
	}

	getOtherSensorQuery(knownSensors, askedSensors, filterValues, filter){
		let infor =  {'sensors': askedSensors, 'knownSensors': knownSensors, 'filterValues': filterValues, 'filter': filter};
		this.setState({
			showQueries: false,
			loadingQuery: true,
			queryInfor: infor,
			queryType: 'otro',
		});

		let chartType = scatterChartName;

		const querystring = require('querystring');
		let numberOfResponses = 0;
		let sensorsResponse = {};

		this.recursiveOtroSensorCall(askedSensors, knownSensors, filterValues, filter, numberOfResponses, sensorsResponse, chartType);
	}

	recursiveOtroSensorCall(askedSensors, knownSensors, filterValues, filter, nResponses, sensorsResponse, chartType){
		const querystring = require('querystring');
		var query = Queries.getOtherSensorQueryIndividual(knownSensors, askedSensors[nResponses], filterValues, filter, orderBy);
		axios.post(usedURL,
			querystring.stringify({'query': query})
		)
		.then((response) => {
			console.log(response);
			const sensorId = askedSensors[nResponses];
			sensorsResponse[sensorId] = response.data["results"]["bindings"];
			nResponses++;
			if (nResponses === askedSensors.length){
				console.log("finalizado!, podemos continuar");
				let allChartData = DataFunctions.prepareResponseData(sensorsResponse, {'sensors': askedSensors, 'type': 'otro'}, this.props.infoSensores);
				console.log(allChartData);
				this.setState({
					showChart: true,
					allChartData: allChartData,
					chartType: chartType,
				});
			}
			else{
				console.log("New axios call with nResponse: " + nResponses);
				this.recursiveOtroSensorCall(askedSensors, knownSensors, filterValues, filter, nResponses, sensorsResponse, chartType);
			}
		})
		.catch((error) => {
			console.log(error);
			alert("An error occurred, check the console.log for more info.");
			this.newQuery();
		});
	}

	getAnomaliasQuery(sensorsDir, parMotor, filter){
		// const selectedSensors = this.state.selectedSensors.slice();
		let selectedSensors = [];
		_.forEach(sensorsDir, (value, key) => {
			selectedSensors.push(key);
		});

		let infor = {'sensors': selectedSensors, 'sensorsDir':sensorsDir, 'parMotor':parMotor, 'filter':filter};
		this.setState({
			showQueries: false,
			loadingQuery: true,
			queryInfor: infor,
			queryType: 'anom',
		});

		let chartType = scatterChartName;

		let numberOfResponses = 0;
		let sensorsResponse = {};

		// console.log("First axios call with nResponses: " + numberOfResponses);
		this.recursiveAnomCall(selectedSensors, sensorsDir, parMotor, filter, numberOfResponses, sensorsResponse, chartType);
	}

	recursiveAnomCall(selectedSensors, sensorsDir, parMotor, filter, nResponses, sensorsResponse, chartType){
		const querystring = require('querystring');
		var query = Queries.getInformationQueryIndividual(selectedSensors[nResponses], {}, filter, {}, orderBy);
		axios.post(usedURL,
			querystring.stringify({'query': query})
		)
		.then((response) => {
			console.log(response);
			const sensorId = selectedSensors[nResponses];
			sensorsResponse[sensorId] = response.data["results"]["bindings"];
			nResponses++;
			if (nResponses === selectedSensors.length){
				console.log("finalizado!, podemos continuar");
				let allChartData = DataFunctions.prepareResponseDataAnomalias(sensorsResponse, selectedSensors, sensorsDir, parMotor, this.props.infoSensores);
				console.log(allChartData);
				this.setState({
					showChart: true,
					allChartData: allChartData,
					chartType: chartType,
				});
			}
			else{
				// console.log("New axios call with nResponse: " + nResponses);
				this.recursiveAnomCall(selectedSensors, sensorsDir, parMotor, filter, nResponses, sensorsResponse, chartType);
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
		let showQueries = false;
		if (selectedSensors.length > 0){
			showQueries = true;
		}
		this.setState({
			showQueries: showQueries,
			loadingQuery: false,
			showChart: false,
			queryType: '',
			queryInfor: {},
		});
	}

	makeQueryResume(){
		const type = this.state.queryType;
		const info = this.state.queryInfor;
		const showChart = this.state.showChart;

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

		const loadingQueryCard = (loadingQuery)
			&& (this.makeQueryResume());

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
