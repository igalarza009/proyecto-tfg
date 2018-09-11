// QueriesSelectMachine.js
// --------------------------------------------------------------
// Página principal de la funcionalidad de consulta de Datos.
// Selección de la máquina a consultar.
// CONTIENE CAMBIOS NECESARIOS PARA LA UNIÓN CON I4TSPS.
// --------------------------------------------------------------

import React from 'react';
import '../../index.css';
import M from 'materialize-css';
import {SensorsInfo} from './QueriesPage.js'
import axios from 'axios';
import {Card, Button, Row, Col} from 'react-materialize'
import * as DataFunctions from '../Functions/DataFunctions.js'
import * as Queries from '../Functions/SPARQLQueries.js';

const _ = require('lodash');

const virtuosoURL = 'http://localhost:8890/sparql';
const virtuosoDebianUrl = 'http://35.237.115.247:8890/sparql';
const RESTfulURLQuery = 'http://localhost:8080/VirtuosoPruebaWeb2/rest/service/query';
const usedURL = virtuosoURL;

// ------- COMENTAR AL HACER LA UNIÓN CON I4TSPS -------
const machineId = "1086_WWN_BGY3MW_3";
// -----------------------------------------------------

export class QueriesSelectMachine extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			infoSensores: [],
			state: 'selecMaq',
			errorLoading: false,
			noMachineInfo: false,
			machines: {},
			selectedMachine: null,
		};
	}

	componentDidMount(){
		const idOrg = this.props.idOrganization;

		// ------------------ CAMBIAR PARA LA UNIÓN CON I4TSPS ------------------

		// --- Comentar esto: ---
		const infoGeneral = require('../../semanticModule.json');
		const maquinas = infoGeneral['SemanticModule']['Organizations'][idOrg];
		this.setState({
			machines: maquinas,
		});

		// --- Descomentar esto: ---
		// ref.child(`Modules/SemanticModule/Organizations/${idOrg}`).once('value')
	    //     .then(snap =>{
		// 		var infoGeneral = snap.val()
		// 		console.log(infoGeneral);
		// 		this.setState({
		// 			machines: infoGeneral,
		// 		});
	 	// 	})

		// ------------------------------------------------------------------------------------
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
