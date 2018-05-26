import React from 'react';
import '../../index.css';
import * as Queries from './SPARQLQueries.js';
import {Button, Row, Col, Card} from 'react-materialize'
import M from 'materialize-css';
import axios from 'axios';
import {GoogleChart} from './GoogleChart.js'
import {PruebaTabsMat} from './QueryTabs.js'

var _ = require('lodash');

const infoSensores = require('../../infoSensores.json');
const sensorIconNames = ['tempIcon', 'resistIcon', 'ventIcon', 'rpmIcon', 'consumoIcon', 'presionIcon', 'tempFundidoIcon'];
const sensorIconTooltips = {'tempIcon':'Temperatura', 'resistIcon':'Resistencia', 'ventIcon':'Ventilación', 'rpmIcon':'R.P.M. del motor', 'consumoIcon':'Consumo del motor', 'presionIcon':'Presión', 'tempFundidoIcon':'Temperatura de fundido'};

export class SensorsInfo extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			selectedSensors: [],
			// selectedTab: {'info': true, 'otro':false, 'anom': false},
			showQueries: false,
			moreThanOneSensor: false,
			loadingQuery: false,
			showChart: false,
			allChartData: null
		};
	}

	toggleSelectedSensor(sensor){
		const selectedSensors = this.state.selectedSensors.slice();
		const sensorIndex = selectedSensors.indexOf(sensor);
		const showQueries = this.state.showQueries;
		const moreThanOneSensor = this.state.moreThanOneSensor;
		const loadingQuery = this.state.loadingQuery;
		const showChart = this.state.showChart;

		if (sensorIndex < 0){
			selectedSensors.push(sensor);
		}
		else{
			selectedSensors.splice(sensorIndex, 1);
		}
		this.setState({
			selectedSensors: selectedSensors,
		});

		if (selectedSensors.length > 0 && !showQueries && !loadingQuery && !showChart){
			this.setState({
				showQueries: true,
			});
		}
		if (selectedSensors.length > 1 && !moreThanOneSensor){
			this.setState({
				moreThanOneSensor: true,
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
			if (sensorIndex < 0){
				classes = 'sensorDiv z-depth-1 ' + sensorClass;
			}
			else{
				classes = 'sensorDivSelected z-depth-1 ' + sensorClass;
			}
			return(
				<div key={sensorId} className={classes} onClick={() => this.toggleSelectedSensor(sensorId)}> </div>
			);
		});

		const iconDivs = sensorIcons.map((iconName) => {
			const classes = 'iconDiv tooltipped ' + iconName;
			const tooltipName = sensorIconTooltips[iconName];
			return(
				<div key={classes} className={classes} data-position="top" data-delay="10" data-tooltip={tooltipName}>
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
			? (<p className='center'> Selecciona el sensor o sensores deseados </p>)
			: (<div> <p> Sensores seleccionados: </p> <div className='margin-left margin-top'> {selectedSensorsNames} </div> </div>);

		return(
			<Card header={
				<div className='mapContainer'>
					<img alt='Mapa de sensores' src={require('../../img/extrusora_editada_grande_claro.png')}/>
					{iconDivs}
					{sensorDivs}
				</div>} >
				{cardValue}
			</Card>
		)
	}

	getInformationQuery(sensors, groupBy, filter, orderBy){

		this.setState({
			showQueries: false,
			loadingQuery: true,
		});

		const query = Queries.getInformationQuery(sensors, groupBy, filter, orderBy);

		// console.log(query);

		const querystring = require('querystring');
		// console.log(querystring.stringify({'query': query}));
		axios.post('http://localhost:8890/sparql', querystring.stringify({'query': query}),{
			headers: {'Accept': 'application/json'},
		})
		.then((response) => {
			console.log(response);
			let allChartData = this.prepareResponseData(response.data, {'sensors': sensors, 'groupBy': groupBy, 'filter': filter, 'orderBy': orderBy, 'type': 'infor'});
			console.log(allChartData);
			this.setState({
				showChart: true,
				allChartData: allChartData,
			});
			// var file = new Blob([JSON.stringify(response.data)], {type: 'application/json'});
			// var outputFileName = 'queryPruebaResults.json'

			// if (window.navigator.msSaveOrOpenBlob) // IE10+
		 //        window.navigator.msSaveOrOpenBlob(file, outputFileName);
		 //    else { // Others
		 //        var a = document.createElement("a"),
		 //                url = URL.createObjectURL(file);
		 //        a.href = url;
		 //        a.download = outputFileName;
		 //        document.body.appendChild(a);
		 //        a.click();
		 //        setTimeout(function() {
		 //            document.body.removeChild(a);
		 //            window.URL.revokeObjectURL(url);
		 //        }, 0);
		 //    }
		})
		.catch((error) => {
			console.log(error);
			alert("An error occurred, check the console.log for more info.");
			this.newQuery();
		});

	}

	getOtherSensorQuery(knownSensors, askedSensors, quitarAnomalias, orderByDate){

		this.setState({
			showQueries: false,
			loadingQuery: true,
		});

		const query = Queries.getOtherSensorQuery(knownSensors, askedSensors, quitarAnomalias, orderByDate);

		// console.log(query);

		const querystring = require('querystring');
		// console.log(querystring.stringify({'query': query}));
		axios.post('http://localhost:8890/sparql', querystring.stringify({'query': query}),{
			headers: {'Accept': 'application/json'},
		})
		.then((response) => {
			// console.log(response);
			let allChartData = this.prepareResponseData(response.data, {'sensors': askedSensors, 'type': 'otro'});
			console.log(allChartData);

			// let options = {'title':'Relación entre los valores de los sensores'};

			this.setState({
				showChart: true,
				allChartData: allChartData,
			});
			// console.log(response);
			// var file = new Blob([response.data], {type: 'text/html'});
			// var outputFileName = 'queryPruebaResults.html'

			// if (window.navigator.msSaveOrOpenBlob) // IE10+
		 //        window.navigator.msSaveOrOpenBlob(file, outputFileName);
		 //    else { // Others
		 //        var a = document.createElement("a"),
		 //                url = URL.createObjectURL(file);
		 //        a.href = url;
		 //        a.download = outputFileName;
		 //        document.body.appendChild(a);
		 //        a.click();
		 //        setTimeout(function() {
		 //            document.body.removeChild(a);
		 //            window.URL.revokeObjectURL(url);
		 //        }, 0);
		 //    }
		})
		.catch((error) => {
			console.log(error);
			alert("An error occurred, check the console.log for more info.");
			this.newQuery();
		});
	}

	prepareResponseData(response, info){

		// info: (sensors, groupBy, filter, orderBy, type)

  		const month = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
		const results = response["results"]["bindings"];

		let selectValues = [];
		let selectDateTime = '';

		let sensors = {};
		let datetimes = [];
		// let dataHeaders = [];
		// let iDataHeader = 0;

		if (info['type'] === 'infor'){
			if (!info['groupBy']['groupByAll']){
				let dateTimeHeader = 'Día y hora';

				if (info['groupBy']['groupBy']){
					if (info['groupBy']['groupByDate']) {
				    	selectDateTime = 'resultDate';
				    	dateTimeHeader = 'Día';
				    }
				    else if (info['groupBy']['groupByHour']){
				    	selectDateTime = 'resultHour';
				    	dateTimeHeader = 'Hora inicial';
				    }
					if (info['groupBy']['avg']){
						selectValues.push('avgValue');
						console.log('push in select values' + selectValues);
					}
					if (info['groupBy']['min']){
						selectValues.push('minValue');
					}
					if (info['groupBy']['max']){
						selectValues.push('maxValue');
					}
				}
				else {
					selectValues.push('resultValue');
					selectDateTime = "resultTime";
				}

				datetimes.push(dateTimeHeader);
			}
		}
		else{
			selectValues.push('resultValue');
			selectDateTime = "resultTime";
			datetimes.push("Día y hora");
		}

		let allChartData = [];

		if (selectValues.length === 1){
			info['sensors'].forEach((sensorId) => {
				sensors[sensorId] = [sensorId];
			});
		}
		else{
			info['sensors'].forEach((sensorId) => {
				sensors[sensorId] = {};
				selectValues.forEach((selectValue) => {
					sensors[sensorId][selectValue] = [selectValue];
				})
			});
		}

		results.forEach((value) => {
			var sensorNameValue = value["sensorName"]["value"];
			var indexName = sensorNameValue.indexOf('#');
			var sensorId = sensorNameValue.substring(indexName+7);

			if (selectDateTime !== '' && info['sensors'][0] === sensorId){
				var resultDateTimeValue = value[selectDateTime]["value"];
				var datetime;
					if (selectDateTime === 'resultDate'){
					var indexFirstDash = resultDateTimeValue.indexOf('-');
					var monthNumber = parseInt(resultDateTimeValue.substring(indexFirstDash+1, indexFirstDash+3), 10);
					var day = resultDateTimeValue.substring(indexFirstDash+4,indexFirstDash+6);
					datetime = day + ' ' + month[monthNumber-1];
				}
				else if (selectDateTime === 'resultHour'){
					// var hora = resultDateTimeValue.substring(0,2);
					datetime = resultDateTimeValue.substring(0,5);
				}
				else {
					datetime = resultDateTimeValue;
				}
			datetimes.push(datetime);
			}

			if (selectValues.length === 1){
				sensors[sensorId].push(parseFloat(value[selectValues[0]]["value"]));
			}
			else{
				selectValues.forEach((selectValue) => {
					sensors[sensorId][selectValue].push(parseFloat(value[selectValue]["value"]));
				});
			}
		});

		if (selectValues.length === 1){
			let dataToZip = [datetimes];

			info['sensors'].forEach((sensorId) => {
				dataToZip.push(sensors[sensorId]);
			})

			let chartData = _.zip.apply(_,dataToZip);

			allChartData.push(chartData);
		}
		else{
			_.forEach(sensors, (sensorData, sensorId) =>{
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

		const queriesCardMat = (showQueries)
			? (<PruebaTabsMat
          selectedSensors={selectedSensors}
          moreThanOneSensor={moreThanOneSensor}
          getInformationQuery={(s,g,f,o) => {this.getInformationQuery(s,g,f,o);}}
          getOtherSensorQuery={(k,a,q,o) => {this.getOtherSensorQuery(k,a,q,o);}}
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
			chartCard = <Card className='center'> <img className='loading' alt='Cargando...' src={require('../../img/loading_bars.gif')}/> </Card>;
		}
		if (showChart){
			chartCard = <GoogleChart allChartData={allChartData}/>;
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
