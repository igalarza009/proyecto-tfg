// index.js

// <div>Icons made by <a href="https://www.flaticon.com/authors/epiccoders" title="EpicCoders">EpicCoders</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>

import React from 'react';
// import ReactDOM from 'react-dom';
import '../../index.css';
// import {ParseData} from './js/DataModules/DataPage.js'
import M from 'materialize-css';
import {SensorsInfo} from './QueriesPage.js'
import axios from 'axios';
import {Card, Button, Row, Col} from 'react-materialize'
import * as DataFunctions from '../Functions/DataFunctions.js'
import * as Queries from '../Functions/SPARQLQueries.js';
// import $ from 'jquery';
// import {MainPage} from './main.js';

const _ = require('lodash');

const virtuosoURL = 'http://localhost:8890/sparql';
const virtuosoDebianUrl = 'http://35.237.115.247:8890/sparql';
const RESTfulURLQuery = 'http://localhost:8080/VirtuosoPruebaWeb2/rest/service/query';
// const RESTfulURLGetQuery = 'http://localhost:8080/VirtuosoPruebaWeb2/rest/service/queryGet?query=';
const usedURL = virtuosoURL;

const machineId = "1086_WWN_BGY3MW_3";

export class QueriesSelectMachine extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			// preguntasSelected: {},
			infoSensores: [],
			state: 'selecMaq',
			errorLoading: false,
			noMachineInfo: false,
			machines: {},
			selectedMachine: null,
			// infoOrganizacion: {}
		};
	}

	componentDidMount(){
		const idOrg = this.props.idOrganization;

		// ------------------Cambiar esta parte al hacer la unión con I4TSPS ------------------
		const infoGeneral = require('../../semanticModule.json');
		const maquinas = infoGeneral['SemanticModule']['Organizations'][idOrg];
		// ------------------------------------------------------------------------------------

		this.setState({
			// infoOrganizacion: orgActual,
			machines: maquinas,
		});
	}

	loadMachineInfo(id){
        this.setState({
            state: 'cargando',
        });
		const machines = this.state.machines;
		const machineInfo = machines[id];

		if (id === machineId){
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
						state: 'showQueries',
						errorLoading: false,
						selectedMachine: machineInfo,
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
		else{
			this.setState({
				noMachineInfo: true,
			})
		}

	}

	selectNewMachine(){
		this.setState({
			state: 'selecMaq',
			errorLoading: false,
			noMachineInfo: false,
		})
	}

	render(){
		const state = this.state.state;
		const infoSensores = this.state.infoSensores;
		const errorLoading = this.state.errorLoading;
        const machines = this.state.machines;
		const selectedMachine = this.state.selectedMachine;
		const noMachineInfo = this.state.noMachineInfo;

		const cargando = (state === 'cargando' && !errorLoading && !noMachineInfo)
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

		const noMachineError = (state === 'cargando' && noMachineInfo) &&
			(<Card s={12} l={8} offset='l2'
				title="Información no disponible"
				className='center'
				actions={
					<Button className="blue darken-3"
						onClick={() => {this.selectNewMachine();}}>
						Elegir otra máquina
					</Button>}>
				<p>Actualmente no hay información disponible sobre la máquina seleccionada.</p>
			</Card>);

		let listaMaq = [];

        _.forEach(machines, (value, key) => {
			// const id = value['id'];
			const tipo = value['type'];
            const altValue = 'Imagen de la máquina ' + key;
            listaMaq.push(
					<div className="col s12 m6 l4">
						<Card className="center machine_card_consult pointer"  onClick={() => {this.loadMachineInfo(key);}}
							header={<img width="100%" alt={altValue} src={require('../img/' + tipo + '.png')}/>}>
		        			La máquina <span className='bold'> {key} </span>.
		        		</Card>
	                </div>
            );
        });

        const maq = (state === 'selecMaq') && (listaMaq);

        const showPreguntas = (state === 'showQueries') &&
            (<SensorsInfo infoSensores={infoSensores} infoMaquina={selectedMachine}/>);

		return(
			<div className='container'>
				<div className="row">
                    {maq}
                    {cargando}
                    {cardError}
					{noMachineError}
                    {showPreguntas}
                </div>
			</div>
		)
	}
}
