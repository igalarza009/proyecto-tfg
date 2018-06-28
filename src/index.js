// index.js

// <div>Icons made by <a href="https://www.flaticon.com/authors/epiccoders" title="EpicCoders">EpicCoders</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {ParseData} from './js/DataModules/DataPage.js'
import M from 'materialize-css';
import {SensorsInfo} from './js/QueriesModules/QueriesPage.js'
import axios from 'axios';
import {Card} from 'react-materialize'
import $ from 'jquery';

const virtuosoURL = 'http://localhost:8890/sparql';
const RESTfulURLQuery = 'http://localhost:8080/VirtuosoPruebaWeb2/rest/service/query';
// const RESTfulURLGetQuery = 'http://localhost:8080/VirtuosoPruebaWeb2/rest/service/queryGet?query=';
const usedURL = virtuosoURL;
// const graphURI = "<http://www.sensores.com/ontology/prueba08/extrusoras#>";
const graphURI = "<http://www.sensores.com/ontology/pruebas_insert/extrusoras#>";

class SelectedPage extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			preguntasSelected: {},
			infoSensores: [],
			selectedPage: 'cargando',
			errorLoading: false,
		};
	}

	componentDidMount(){
		$(".button-collapse").sideNav();

		let query = 'prefix : ' + graphURI + ' ' +
				'prefix owl: <http://www.w3.org/2002/07/owl#> ' +
				'prefix sosa: <http://www.w3.org/ns/sosa/> ' +
				'prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
				'prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> ' +
				'prefix qu: <http://purl.oclc.org/NET/ssnx/qu/qu#> ' +
				'select ?sensorId ?name ?class ?sensorType ?observationType ?resultType ?zone ?observedProperty ?measureUnit ?minValue ?maxValue ' +
				'from ' + graphURI + ' ' +
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

		const querystring = require('querystring');
		axios.post(usedURL,
			querystring.stringify({'query': query})
		)
		.then((response) => {
			console.log(response);
			let infoSensores = getInfoSensores(response.data["results"]["bindings"]);
			this.setState({
				infoSensores: infoSensores,
				selectedPage: 'preguntas',
				errorLoading: false,
			})
		})
		.catch((error) => {
			console.log(error);
			this.setState({
				errorLoading: true,
			})
		});
	}

	mostrarPreguntas(){
		this.setState({
			preguntasSelected: true,
			selectedPage: 'preguntas',
		});
	}

	mostrarTraductorDatos(){
		this.setState({
			preguntasSelected: false,
			selectedPage: 'datos',
		});
	}

	render(){
		const preguntasSelected = this.state.preguntasSelected;
		const selectedPage = this.state.selectedPage;
		const infoSensores = this.state.infoSensores;
		const errorLoading = this.state.errorLoading;

		const cargando = (selectedPage === 'cargando' && !errorLoading)
			? (<Card s={12} l={8} offset='l2' title="Cargando datos..." className='center'>
				<img className='loading' alt='Cargando...'
						src={require('./img/loading_bars.gif')}
					/>
				</Card>)
			: (null);

		const cardError = (selectedPage === 'cargando' && errorLoading) &&
			(<Card s={12} l={8} offset='l2' title="Error al cargar datos" className='center'>
				<p>Ha ocurrido un error al cargar los datos necesarios desde el servidor.</p>
				<p>Vuelva a cargar la página para intentar solucionarlo.</p>
			</Card>);

		const queries = (selectedPage === 'preguntas')
			? (<SensorsInfo infoSensores={infoSensores}/>)
			: (null);

		const datos = (selectedPage === 'datos')
			? (<ParseData infoSensores={infoSensores}/>)
			: (null);

		let preguntasClass = '';
		let traductorClass = '';

		if (selectedPage === 'preguntas'){
			preguntasClass = preguntasClass + 'active ';
		}

		if (selectedPage === 'datos'){
			traductorClass = traductorClass + 'active ';
		}

		const navBar = (selectedPage === 'cargando')
			? (<div className="nav-wrapper">
					<a href="#" className="brand-logo center">Información sobre sensores</a>
				</div>)
			: (<div className="nav-wrapper">
					<a href="#" className="brand-logo center">Información sobre sensores</a>
					<a href="#" data-activates="mobile-demo" className="button-collapse">
						<i className="material-icons">menu</i>
					</a>
					<ul id="nav-mobile" className="left hide-on-med-and-down">
						<li className={preguntasClass}>
							<a href="#" onClick={() => this.mostrarPreguntas()}>
								Preguntas
							</a>
						</li>
						<li className={traductorClass}>
							<a href="#" onClick={() => this.mostrarTraductorDatos()}>
								Traductor datos
							</a>
						</li>
					</ul>
					<ul id="mobile-demo" className="side-nav">
						<li className={preguntasClass}>
							<a href="#" onClick={() => this.mostrarPreguntas()}>
								Preguntas
							</a>
						</li>
						<li className={traductorClass}>
							<a href="#" onClick={() => this.mostrarTraductorDatos()}>
								Traductor datos
							</a>
						</li>
					</ul>
				</div>);

		return(
			<div>
				<div className='navBar'>
					<nav className='blue darken-3'>
					    {navBar}
					</nav>
				</div>
				<div className='container'>
					{cargando}
					{cardError}
					{queries}
					{datos}
				</div>
			</div>
		)
	}
}

ReactDOM.render(
	<SelectedPage />,
  	document.getElementById('root')
);

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
