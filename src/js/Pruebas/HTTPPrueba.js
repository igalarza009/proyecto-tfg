import React from 'react';
import ReactDOM from 'react-dom';
import '../../index.css';
import * as Queries from '../QueriesModules/SPARQLQueries.js';
import {Row, Col, Button, Card} from 'react-materialize'
import M from 'materialize-css';
import axios from 'axios';

export class HTTPPrueba extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			httpRespuesta: '',
		};

		this.handleClickQuery = this.handleClickQuery.bind(this);
		this.handleClickHello = this.handleClickHello.bind(this);
		// this.handleQuerySinAxios = this.handleQuerySinAxios.bind(this);
	}

	handleClickHello(){
		const getURL = "http://localhost:8080/VirtuosoPruebaWeb2/rest/service/hello?name=irati";
		axios.get(getURL)
		.then((response) => {
			console.log(response);
		})
		.catch((error) => {
			console.log(error);
		});
	}

	// handleQuerySinAxios(){
	//
	//
	// 			let sensors = ['VMTKD6', '2F1KT7'];
	// 			let groupBy = {
	// 			 	'groupBy': true,
	// 				'groupByDate': false,
	// 				'groupByHour': true,
	// 				'avg': true,
	// 				'min': false,
	// 				'max': false
	// 			};
	//
	// 			let filter = {
	// 				'filter': true,
	// 				'filterDate': true,
	// 				'startDate': '2018-03-01',
	// 				'endDate': '2018-03-31',
	// 				'filterTime': true,
	// 				'startTime': '12:00:00',
	// 				'endTime': '16:59:59'
	// 			};
	//
	// 			let orderBy = {
	// 				'orderBy': true,
	// 				'order': 'desc',
	// 				'orderField': 'dateTime'
	// 			};
	//
	//
	// 			const query = Queries.getInformationQuery(sensors, groupBy, filter, orderBy);
	// 			// const query = Queries.getOtherSensorQuery(knownSensors, askedSensors, quitarAnomalias, orderByDate);
	//
	//
	// 	const baseURL = "http://localhost:8080/VirtuosoPruebaWeb2/rest/service/query";
	// 	var queryURL=baseURL + '?query=' + encodeURIComponent(query);
	//
	// 	if (window.XMLHttpRequest) {
	//   		xmlhttp=new XMLHttpRequest();
	//   	}
	//   	else {
	//   		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	//   	}
	//   	xmlhttp.open("GET",queryURL,false);
	// 	alert("enviando...");
	//   	xmlhttp.send();
	// 	alert("enviado");
	// 	return JSON.parse(xmlhttp.responseText);
	// }

	handleClickQuery(){

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

		// const query="select distinct ?Concept where {[] a ?Concept} LIMIT 100";
		const getURL = "http://localhost:8080/VirtuosoPruebaWeb2/rest/service/query?query=";
		const encodedQuery = getURL + encodeURIComponent(query);
		alert(encodedQuery);
		axios.get(encodedQuery)
		.then((response) => {
			console.log(response);
		})
		.catch((error) => {
			console.log(error);
		});

	}
	render(){

		return(
			<Card className='center blue-text darken-3'>
				<Row>
					<Col s={12} l={6}>
						<Button className='pink lighten-1' onClick={this.handleClickQuery}>
							Prueba Query
						</Button>
					</Col>
					<Col s={12} l={6}>
						<Button className='purple lighten-1' onClick={this.handleClickHello}>
							Prueba Hello
						</Button>
					</Col>
				</Row>

			</Card>
		)
	}
}
