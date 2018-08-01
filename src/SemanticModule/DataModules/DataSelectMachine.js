// index.js

// <div>Icons made by <a href="https://www.flaticon.com/authors/epiccoders" title="EpicCoders">EpicCoders</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>

import React from 'react';
// import ReactDOM from 'react-dom';
import '../../index.css';
import {ParseData} from './DataPage.js'
import M from 'materialize-css';
// import {SensorsInfo} from './QueriesPage.js'
import axios from 'axios';
import {Card, Button, Row, Col} from 'react-materialize'
import * as DataFunctions from '../Functions/DataFunctions.js'
import * as Queries from '../Functions/SPARQLQueries.js';
// import $ from 'jquery';
// import {MainPage} from './main.js';

const _ = require('lodash');

const virtuosoURL = 'http://localhost:8890/sparql';
const virtuosoDebianUrl = 'http://35.237.115.247:8890//sparql';
const RESTfulURLQuery = 'http://localhost:8080/VirtuosoPruebaWeb2/rest/service/query';
// const RESTfulURLGetQuery = 'http://localhost:8080/VirtuosoPruebaWeb2/rest/service/queryGet?query=';
const usedURL = virtuosoDebianUrl;

export class DataSelectMachine extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			infoSensores: [],
			state: 'selecMaq',
			errorLoading: false,
			machines: [],
			selectedMachine: null
		};
	}

	componentDidMount(){
		const idOrg = this.props.idOrganization;
		const infoGeneral = require('../../semanticModule.json');
		const maquinas = infoGeneral['SemanticModule']['Organizations'][idOrg];
		// let maquinas = [];

		this.setState({
			// infoOrganizacion: orgActual,
			machines: maquinas,
		});
	}

	loadMachineInfo(){
        this.setState({
            state: 'cargando',
        });

        let query = Queries.getInfoSensoresQuery();

		const querystring = require('querystring');
		console.log('Realizamos la consulta de información a Virtuoso');
		axios.post(usedURL,
			querystring.stringify({'query': query})
		)
		.then((response) => {
			console.log(response);
			let results = response.data["results"]["bindings"];
			if (results.length > 0) {
				let infoSensores = DataFunctions.getInfoSensores(results);
				this.setState({
					infoSensores: infoSensores,
					state: 'showData',
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
		const state = this.state.state;
		const infoSensores = this.state.infoSensores;
		const errorLoading = this.state.errorLoading;
        const machines = this.state.machines;

		const cargando = (state === 'cargando' && !errorLoading)
			? (<Card s={12} l={8} offset='l2' title="Cargando datos..." className='center'>
				<img className='loading' alt='Cargando...'
						src={require('../img/loading_bars.gif')}
					/>
				</Card>)
			: (null);

		const cardError = (state === 'cargando' && errorLoading) &&
			(<Card s={12} l={8} offset='l2' title="Error al cargar datos" className='center'>
				<p>Ha ocurrido un error al cargar los datos necesarios desde el servidor.</p>
				<p>Vuelva a cargar la página para intentar solucionarlo.</p>
			</Card>);

			let listaMaq = [];

	        _.forEach(machines, (value, key) => {
				// const id = value['id'];
				const tipo = value['type'];
	            const altValue = 'Imagen de la máquina ' + key;
	            listaMaq.push(
	                <Col key={key} s={12} m={6} l={4}>
	                    <Card header={
	        					<img width="100%" alt={altValue}
	        						src={require('../img/' + tipo + '.png')}
	        					/>}
	                            actions={
	                                [<Button className="blue darken-3" onClick={() => {this.loadMachineInfo(key);}}>
	                                    Seleccionar
	                                </Button>]
	                            }>
	        				La máquina {key}.
	        			</Card>
	                </Col>
	            );
	        });

        const maq = (state === 'selecMaq') && (listaMaq);

        const showDatos = (state === 'showData') &&
            (<ParseData infoSensores={infoSensores}/>);

		return(
			<div className='container'>
				<Row>
                    {maq}
                    {cargando}
                    {cardError}
                    {showDatos}
                </Row>
			</div>
		)
	}
}
