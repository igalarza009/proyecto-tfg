// index.js

// <div>Icons made by <a href="https://www.flaticon.com/authors/epiccoders" title="EpicCoders">EpicCoders</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>

import React from 'react';
// import ReactDOM from 'react-dom';
import '../../index.css';
// import {ParseData} from './js/DataModules/DataPage.js'
import M from 'materialize-css';
// import {SensorsInfo} from './js/QueriesModules/QueriesPage.js'
import axios from 'axios';
import {Card, Button, Row, Col} from 'react-materialize'
// import $ from 'jquery';
// import {MainPage} from './main.js';

const virtuosoURL = 'http://localhost:8890/sparql';
const virtuosoDebianUrl = 'http://104.196.204.155:8890/sparql';
const RESTfulURLQuery = 'http://localhost:8080/VirtuosoPruebaWeb2/rest/service/query';
// const RESTfulURLGetQuery = 'http://localhost:8080/VirtuosoPruebaWeb2/rest/service/queryGet?query=';
const usedURL = virtuosoURL;
// const graphURI = "<http://www.sensores.com/ontology/prueba08/extrusoras#>";
// const graphURI = "<http://www.sensores.com/ontology/pruebas_insert/extrusoras#>";
// const graphURI = '<http://www.sensores.com/ontology/pruebas_fixed/extrusoras#>';
// const graphURI = "<http://www.sensores.com/ontology/prueba09/extrusoras#>";
// const graphURI = "<http://www.sensores.com/ontology/nuevo_02/extrusoras#>";
const graphURI = "<http://www.sensores.com/ontology/datos_reduc/extrusoras#>";

export class QueriesSelectMachine extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			// preguntasSelected: {},
			infoSensores: [],
			state: 'selecMaq',
			errorLoading: false,
		};
	}

    // componentDidMount(){
    //     const machines = this.props.machines;
    //
    //     const machines.forEach((value) => {
    //         return(
    //             <Col key={} s={12} m={6} l={4}>
    //                 <Card>
    //
    //                 </Card>
    //             </Col>
    //         )
    //     });
    // }

	loadMachineInfo(){
		let query = 'prefix : ' + graphURI + ' ' +
				'prefix owl: <http://www.w3.org/2002/07/owl#> ' +
				'prefix sosa: <http://www.w3.org/ns/sosa/> ' +
				'prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
				'prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> ' +
				'prefix qu: <http://purl.oclc.org/NET/ssnx/qu/qu#> ' +
				'select ?sensorId ?name ?class ?sensorType ?observationType ?valueType ?zone ?observedProperty ?measureUnit ?minValue ?maxValue ' +
				'from ' + graphURI + ' ' +
				'where { ' +
				    '?metaSensorType rdf:type owl:Class ; ' +
				     'rdfs:subClassOf sosa:Sensor . ' +
				    '?sensorType rdfs:subClassOf ?metaSensorType .  ' +
				    '?metaSensorType rdfs:subClassOf [ rdf:type owl:Restriction ; ' +
				                                    'owl:onProperty sosa:madeObservation ; ' +
				                                    'owl:allValuesFrom ?observationType ' +
				                                '] . ' +
					'?observationType rdfs:subClassOf [ rdf:type owl:Restriction ; ' +
													'owl:onProperty sosa:hasSimpleResult ; ' +
													'owl:allValuesFrom ?valueType ' +
												'] . ' +
				    '?sensorType rdfs:subClassOf [ rdf:type owl:Restriction ; ' +
				                                    'owl:onProperty sosa:observes ; ' +
				                                    'owl:hasValue ?observedProperty ' +
				                                '] . ' +
				    'optional { ' +
				    	'?observedProperty qu:unit ?measureUnit . ' +
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
				                ':sensorName ?name . ' +
				    'optional { ?sensorName :zone ?zone . } ' +
				'} ' +
				'order by asc(?name)';

		const querystring = require('querystring');
		console.log('Realizamos la consulta de información a Virtuoso');
		axios.post(usedURL,
			querystring.stringify({'query': query})
		)
		.then((response) => {
			console.log(response);
			let results = response.data["results"]["bindings"];
			if (results.length > 0) {
				let infoSensores = getInfoSensores(results);
				this.setState({
					infoSensores: infoSensores,
					selectedPage: 'preguntas',
					errorLoading: false,
				});
			}
			else{
				this.setState({
					errorLoading: true,
				});
			}

		})
		.catch((error) => {
			console.log(error);
			this.setState({
				errorLoading: true,
			});
		});
	}

	render(){
		const state = this.state.selectedPage;
		const infoSensores = this.state.infoSensores;
		const errorLoading = this.state.errorLoading;
        const machines = this.props.machines;

		const cargando = (state === 'cargando' && !errorLoading)
			? (<Card s={12} l={8} offset='l2' title="Cargando datos..." className='center'>
				<img className='loading' alt='Cargando...'
						src={require('../../img/loading_bars.gif')}
					/>
				</Card>)
			: (null);

		const cardError = (state === 'cargando' && errorLoading) &&
			(<Card s={12} l={8} offset='l2' title="Error al cargar datos" className='center'>
				<p>Ha ocurrido un error al cargar los datos necesarios desde el servidor.</p>
				<p>Vuelva a cargar la página para intentar solucionarlo.</p>
			</Card>);

        const listaMaq = machines.map((value) => {
            return(
                <Col key={value} s={12} m={6} l={4}>
                    <Card>
                        Aquí iría una imagen de la máquina {value}.
                    </Card>
                </Col>
            )
        });
		return(
			<div>
				<Row>
                    {listaMaq}
                </Row>
			</div>
		)
	}
}

function getInfoSensores(results){
	let infoSensores = [];
	results.forEach((object) => {
		var infoSensor = {};

		infoSensor['indicatorId'] = object['sensorId']['value'];
		infoSensor['name'] = object['name']['value'];
		// infoSensor['class'] = object['class']['value'];

		var sensType = object['sensorType']['value'];
		var iSensType = sensType.indexOf('#');
		var sensTypeParsed = sensType.substring(iSensType+1, sensType.length);
		infoSensor['sensorType'] = sensTypeParsed;

		var obsType = object['observationType']['value'];
		var iObsType = obsType.indexOf('#');
		var obsTypeParsed = obsType.substring(iObsType+1, obsType.length);
		infoSensor['observationType'] = obsTypeParsed;

		var valType = object['valueType']['value'];
		var iValType = valType.indexOf('#');
		var valTypeParsed = valType.substring(iValType+1, valType.length);
		infoSensor['valueType'] = valTypeParsed;

		if (object['zone']){
			infoSensor['zone'] = object['zone']['value'];
		}
		else{
			infoSensor['zone'] = '';
		}

		var obsProp = object['observedProperty']['value'];
		var iObsProp = obsProp.indexOf('#');
		var obsPropParsed = obsProp.substring(iObsProp+1, obsProp.length);
		infoSensor['observedProperty'] = obsPropParsed;

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