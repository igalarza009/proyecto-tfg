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

const virtuosoURL = 'http://localhost:8890/sparql';
const virtuosoDebianUrl = 'http://104.196.204.155:8890/sparql';
const RESTfulURLQuery = 'http://localhost:8080/VirtuosoPruebaWeb2/rest/service/query';
// const RESTfulURLGetQuery = 'http://localhost:8080/VirtuosoPruebaWeb2/rest/service/queryGet?query=';
const usedURL = virtuosoURL;

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
					state: 'showQueries',
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
            const altValue = 'Imagen de la máquina ' + value;
            return(
                <Col key={value} s={12} m={6} l={4}>
                    <Card header={
        					<img width="100%" alt={altValue}
        						src={require('../../img/extrusora_con_sensores.PNG')}
        					/>}
                            actions={
                                [<Button className="blue-text text-darken-3 btn-flat" onClick={() => {this.loadMachineInfo();}}>
                                    Seleccionar máquina {value}
                                </Button>]
                            }>
        				La máquina {value}.
        			</Card>
                </Col>
            )
        });

        const maq = (state === 'selecMaq') && (listaMaq);

        const showPreguntas = (state === 'showQueries') &&
            (<SensorsInfo infoSensores={infoSensores}/>);

		return(
			<div>
				<Row>
                    {maq}
                    {cargando}
                    {cardError}
                    {showPreguntas}
                </Row>
			</div>
		)
	}
}
