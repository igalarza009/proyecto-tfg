import React from 'react';
import ReactDOM from 'react-dom';
import '../../index.css';
import * as Queries from '../QueriesModules/SPARQLQueries.js';
import {Button, Card} from 'react-materialize'
import M from 'materialize-css';
import axios from 'axios';

export class HTTPPrueba extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			httpRespuesta: '',
		};

		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(){

		let sensors = ['VMTKD6', '2F1KT7'];
		let groupBy = {
		 	'groupBy': true,
			'groupByDate': false,
			'groupByHour': true,
			'avg': true,
			'min': false,
			'max': false
		};

		let filter = {
			'filter': true,
			'filterDate': true,
			'startDate': '2018-03-01',
			'endDate': '2018-03-31',
			'filterTime': true,
			'startTime': '12:00:00',
			'endTime': '16:59:59'
		};

		let orderBy = {
			'orderBy': true,
			'order': 'desc',
			'orderField': 'dateTime'
		};

		let knownSensors = {
			'2F1KT7': 'max',
			'649NNJ': 183
		};

		let askedSensors = ['VMTKD6'];

		let quitarAnomalias = true;

		let orderByDate = true;

		// axios.get('http://localhost:8890/sparql?query=' + encodeURIComponent(query),{
		// 	headers: {'Accept': 'text/html'},
		// })

		// const querystring = require('querystring');
		// axios.post('http://localhost:8890/sparql', querystring.stringify({'query': query}),{
		// 	headers: {'Accept': 'text/html'},
		// })

		const query = Queries.getInformationQuery(sensors, groupBy, filter, orderBy);
		// const query = Queries.getOtherSensorQuery(knownSensors, askedSensors, quitarAnomalias, orderByDate);

		// var query = "select ?sensorName ?resultDate (AVG(?resultValue) as ?mediaResultados) " +
		// 							"from <http://www.sensores.com/ontology/prueba03/extrusoras#> " +
		// 							"where { " +
		// 	    					"{ ?sensorType rdfs:subClassOf :DoubleValueSensor . } " +
		// 	     						"union " +
		// 	    					"{ ?sensorType rdfs:subClassOf :BooleanSensor . } " +
		// 	    					"?sensorName rdf:type ?sensorType . " +
		// 	    					"?sensorName rdf:type owl:NamedIndividual . " +
		// 	    					"?sensorName sosa:madeObservation ?obsName . " +
		// 	    					"?obsName sosa:hasResult/sosa:hasSimpleResult ?resultValue . " +
		// 	    					"?obsName sosa:resultTime ?resultTime . " +
		// 	    					"bind(xsd:date(xsd:dateTime(?resultTime)) as ?resultDate) " +
		// 							"} " +
		// 							"group by ?sensorName ?resultDate " +
		// 							"order by desc(?resultDate) ";

		// console.log(query);


		const getURL = "http://localhost:8080/VirtuosoPruebaWeb2/rest/service/query?";
		axios.get(getURL + encodeURIComponent(query))
		.then((response) => {
			console.log(response);
			// var file = new Blob([response.data], {type: 'text/html'});
			// var outputFileName = 'queryPruebaResults.html'
			//
			// if (window.navigator.msSaveOrOpenBlob) // IE10+
		  //       window.navigator.msSaveOrOpenBlob(file, outputFileName);
		  //   else { // Others
		  //       var a = document.createElement("a"),
		  //               url = URL.createObjectURL(file);
		  //       a.href = url;
		  //       a.download = outputFileName;
		  //       document.body.appendChild(a);
		  //       a.click();
		  //       setTimeout(function() {
		  //           document.body.removeChild(a);
		  //           window.URL.revokeObjectURL(url);
		  //       }, 0);
		  //   }
		})
		.catch((error) => {
			console.log(error);
		});

		// const getURL = "http://localhost:8080/VirtuosoPruebaWeb2/rest/service/hello";
		// axios.get(getURL)
		// .then((response) => {
		// 	console.log(response);
		// })
		// .catch((error) => {
		// 	console.log(error);
		// });

	}

	// handleClickSelect(){
	// 	const getURL = "http://localhost:8080/VirtuosoService/rest/extrusion/query?query=";
	//
	// 	axios.get(getURL + encodeURIComponent(query))
	// 	.then((response) => {
	// 		console.log(response);
	// 		// var file = new Blob([JSON.stringify(response.data)], {type: 'application/jsons'});
	// 		// var outputFileName = 'queryPruebaResults.json'
	// 		//
	// 		// if (window.navigator.msSaveOrOpenBlob) // IE10+
	// 	  //       window.navigator.msSaveOrOpenBlob(file, outputFileName);
	// 	  //   else { // Others
	// 	  //       var a = document.createElement("a"),
	// 	  //               url = URL.createObjectURL(file);
	// 	  //       a.href = url;
	// 	  //       a.download = outputFileName;
	// 	  //       document.body.appendChild(a);
	// 	  //       a.click();
	// 	  //       setTimeout(function() {
	// 	  //           document.body.removeChild(a);
	// 	  //           window.URL.revokeObjectURL(url);
	// 	  //       }, 0);
	// 	  //   }
	// 	})
	// 	.catch((error) => {
	// 		console.log(error);
	// 	});
	// }

	render(){

		return(
			<Card className='center blue-text darken-3'>
				<Button className='blue darken-3' onClick={this.handleClick}>Query de prueba</Button>
			</Card>
		)
	}
}
