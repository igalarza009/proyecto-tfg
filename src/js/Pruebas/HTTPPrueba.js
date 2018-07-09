import React from 'react';
import ReactDOM from 'react-dom';
import '../../index.css';
import * as Queries from '../Functions/SPARQLQueries.js';
import {Row, Col, Button, Card} from 'react-materialize'
import M from 'materialize-css';
import axios from 'axios';
import * as Virtuoso from '../Functions/VirtuosoCalls.js';

const querystring = require('querystring');

const virtuosoURL = 'http://localhost:8890/sparql';
const RESTfulURLQuery = 'http://localhost:8080/VirtuosoPruebaWeb2/rest/service/query';
const RESTfulURLGetQuery = 'http://localhost:8080/VirtuosoPruebaWeb2/rest/service/queryGet?query=';
const virtuosoMaqVirtual = 'http://35.237.194.21:8890/sparql';
const usedURL = virtuosoMaqVirtual;

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

	handleClickSelect(){
		const query = 'select * ' +
					'from <http://www.pruebas.com/maquina_virtual/prueba_insert#> ' +
					'where { ' +
					  '?o ?p ?q ' +
					'} ';

		console.log(query);

		axios.post(usedURL,
			querystring.stringify({'query': query})
		)
		.then((response) => {
			console.log(response);
		})
		.catch((error) => {
			console.log(error);
		});
		// Virtuoso.performQuery(query, console.log);
		// console.log(response);
	}

	handleClickInsert(){
		// const query = 'prefix : <http://www.sensores.com/ontology/pruebas_insert/extrusoras#> ' +
		// 	'prefix owl: <http://www.w3.org/2002/07/owl#> ' +
		// 	'prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
		// 	'prefix xsd: <http://www.w3.org/2001/XMLSchema#> ' +
		// 	'prefix sosa: <http://www.w3.org/ns/sosa/>  ' +
		// 	'insert data { ' +
		// 		'graph <http://www.sensores.com/ontology/pruebas_insert/extrusoras# ' +
		// 		'{ ' +
		// 			':sensor2F1KT7date20180324obs1 rdf:type owl:NamedIndividual , ' +
		// 			':TemperatureObservation . ' +
		// 			':sensor2F1KT7date20180324obs1result rdf:type owl:NamedIndividual , ' +
		// 			':DoubleValueResult . ' +
		// 			':sensor2F1KT7date20180324obs1result sosa:hasSimpleResult "195.9"^^xsd:double . ' +
		// 			':sensor2F1KT7date20180324obs1 sosa:hasResult :sensor2F1KT7date20180324obs1result . ' +
		// 			':sensor2F1KT7date20180324obs1 sosa:resultTime "2018-03-24T23:59:59.657Z"^^xsd:dateTime . ' +
		// 			':sensor2F1KT7 sosa:madeObservation :sensor2F1KT7date20180324obs1 . ' +
		// 			':sensor2F1KT7date20180324obs2 rdf:type owl:NamedIndividual , ' +
		// 			':TemperatureObservation . ' +
		// 			':sensor2F1KT7date20180324obs2result rdf:type owl:NamedIndividual , ' +
		// 			':DoubleValueResult . ' +
		// 			':sensor2F1KT7date20180324obs2result sosa:hasSimpleResult "195.9"^^xsd:double . ' +
		// 			':sensor2F1KT7date20180324obs2 sosa:hasResult :sensor2F1KT7date20180324obs2result . ' +
		// 			':sensor2F1KT7date20180324obs2 sosa:resultTime "2018-03-24T23:59:58.657Z"^^xsd:dateTime . ' +
		// 			':sensor2F1KT7 sosa:madeObservation :sensor2F1KT7date20180324obs2 . ' +
		// 	 	'} ' +
		// 	'} ';

		const query = 'PREFIX dc: <http://purl.org/dc/elements/1.1/> ' +
			'insert into ' +
				'graph <http://www.pruebas.com/maquina_virtual/prueba_insert#> ' +
				'{ ' +
					'<http://example/egbook> dc:title  "Tercera prueba desde aplicación." . ' +
			 	'} ';
		//
		console.log(query);

		axios.post(usedURL,
			querystring.stringify({'query': query}))
		.then((response) => {
			console.log(response);
		})
		.catch((error) => {
			console.log(error);
		});

		// axios.post("http://localhost:8080/VirtuosoPruebaWeb2/rest/service/insertprueba")
		// .then((response) => {
		// 	console.log(response);
		// })
		// .catch((error) => {
		// 	console.log(error);
		// });
		// Virtuoso.performQuery(query, console.log);
		// console.log(response);
	}

	handleClickHello(){
		let name = 'Irati Galarza Burguete';
		const querystring = require('querystring');
		// axios.post('http://localhost:8080/VirtuosoPruebaWeb2/rest/service/hello',
		// 	querystring.stringify({'name': name})
		// )
		// .then((response) => {
		// 	console.log(response);
		// })
		// .catch((error) => {
		// 	console.log(error);
		// });
	}

	handleClickQuery(){
		let query = 'prefix : <http://www.sensores.com/ontology/prueba05/extrusoras#> ' +
				'prefix owl: <http://www.w3.org/2002/07/owl#> ' +
				'prefix sosa: <http://www.w3.org/ns/sosa/> ' +
				'prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
				'prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> ' +
				'prefix qu: <http://purl.oclc.org/NET/ssnx/qu/qu#> ' +
				'select ?sensorId ?name ?class ?sensorType ?observationType ?resultType ?zone ?observedProperty ?measureUnit ?minValue ?maxValue ' +
				'from <http://www.sensores.com/ontology/prueba05/extrusoras#> ' +
				'where { ' +
				    '{ ?sensorType rdfs:subClassOf :DoubleValueSensor . } ' +
				     'union ' +
				    '{ ?sensorType rdfs:subClassOf :BooleanSensor . } ' +
				    '?sensorType rdfs:subClassOf [ rdf:type owl:Restriction ; ' +
				                                    'owl:onProperty sosa:madeObservation ; ' +
				                                    'owl:allValuesFrom ?observationType ' +
				                                '] . ' +
				    '?observationType rdf:type owl:Class ; ' +
							        'rdfs:subClassOf ?metaObservationType . ' +
					'?metaObservationType rdfs:subClassOf [ rdf:type owl:Restriction ; ' +
							                                'owl:onProperty sosa:hasResult ; ' +
							                                'owl:allValuesFrom ?resultType ' +
							                             '] . ' +
				    'optional { ' +
				    	'?sensorType rdfs:subClassOf [ rdf:type owl:Restriction ; ' +
				                                        'owl:onProperty sosa:observes ; ' +
				                                        'owl:hasValue ?observedProperty ' +
				                                    '] . ' +
				    '} ' +
				     'optional { ' +
				    	'?sensorType rdfs:subClassOf [ rdf:type owl:Restriction ; ' +
				                                        'owl:onProperty qu:unit ; ' +
				                                        'owl:hasValue ?measureUnit ' +
				                                    '] . ' +
				    '} ' +
				    'optional { ' +
				    	'?sensorType rdfs:subClassOf [ rdf:type owl:Restriction ; ' +
				                                        'owl:onProperty :maxValue ; ' +
				                                        'owl:hasValue ?maxValue ' +
				                                    '] , ' +
				                                    '[ rdf:type owl:Restriction ; ' +
				                                        'owl:onProperty :minValue ; ' +
				                                        'owl:hasValue ?minValue ' +
				                                    '] . ' +
				    '} ' +
				    '?sensorName rdf:type ?sensorType ; ' +
				                'rdf:type owl:NamedIndividual ; ' +
				                ':indicatorId ?sensorId ; ' +
				                ':sensorName ?name ; ' +
				                ':htmlClass ?class . ' +
				    'optional { ?sensorName :zone ?zone . } ' +
				'} ';

		// const querystring = require('querystring');
		// console.log(usedURL + encodeURIComponent(query));
		// axios.get(usedURL + encodeURIComponent(query)
		// )
		// .then((response) => {
		// 	console.log(response);
		// 	let infoSensores = getInfoSensores(response.data["results"]["bindings"]);
		// 	console.log(infoSensores);
		// })
		// .catch((error) => {
		// 	console.log(error);
		// // });
		// const response = Virtuoso.performQuery(query);
		// console.log(response);
		// let infoSensores = getInfoSensores(response.data["results"]["bindings"]);
		// console.log(infoSensores);

	}

	render(){
		return(
			<Card className='center blue-text darken-3'>
				<Row>
					<Col s={12} l={6}>
						<Button className='pink lighten-1' onClick={this.handleClickSelect}>
							Prueba Select
						</Button>
					</Col>
					<Col  s={12} l={6}>
						<Button className='yellow darken-3' onClick={this.handleClickInsert}>
							Prueba Insert
						</Button>
					</Col>
				</Row>

			</Card>
		)
	}
}

function getInfoSensores(results){
	let infoSensores = [];
	results.forEach((object) => {
		var infoSensor = {};

		infoSensor['indicatorId'] = object['sensorId']['value'];
		infoSensor['name'] = object['name']['value'];
		infoSensor['class'] = object['class']['value'];

		var sensType = object['sensorType']['value'];
		var iSensType = sensType.indexOf('#');
		var sensTypeParsed = sensType.substring(iSensType+1, sensType.length);
		infoSensor['sensorType'] = sensTypeParsed;

		var obsType = object['observationType']['value'];
		var iObsType = obsType.indexOf('#');
		var obsTypeParsed = obsType.substring(iObsType+1, obsType.length);
		infoSensor['observationType'] = obsTypeParsed;

		var resType = object['resultType']['value'];
		var iResType = resType.indexOf('#');
		var resTypeParsed = resType.substring(iResType+1, resType.length);
		infoSensor['resultType'] = resTypeParsed;

		if (object['zone']){
			infoSensor['zone'] = object['zone']['value'];
		}
		else{
			infoSensor['zone'] = '';
		}

		if (object['observedProperty']){
			var obsProp = object['observedProperty']['value'];
			var iObsProp = obsProp.indexOf('#');
			var obsPropParsed = obsProp.substring(iObsProp+1, obsProp.length);
			infoSensor['observedProperty'] = obsPropParsed;
		}
		else{
			infoSensor['observedProperty'] = '';
		}

		if (object['measureUnit']){
			var unit = object['measureUnit']['value'];
			var iUnit = unit.indexOf('#');
			var unitParsed = unit.substring(iUnit+1, unit.length);
			infoSensor['measureUnit'] = unitParsed;
		}
		else{
			infoSensor['measureUnit'] = '';
		}

		if (object['minValue']){
			infoSensor['minValue'] = parseInt(object['minValue']['value'], 10);
			infoSensor['maxValue'] = parseInt(object['maxValue']['value'], 10);
		}
		else{
			infoSensor['minValue'] = '';
			infoSensor['maxValue'] = '';
		}

		infoSensores.push(infoSensor);
	});

	return infoSensores;
}
