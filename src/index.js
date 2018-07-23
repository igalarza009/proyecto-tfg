// index.js

// <div>Icons made by <a href="https://www.flaticon.com/authors/epiccoders" title="EpicCoders">EpicCoders</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {ParseData} from './js/DataModules/DataPage.js'
import {DataSelectMachine} from './js/DataModules/DataSelectMachine.js'
import M from 'materialize-css';
import {SensorsInfo} from './js/QueriesModules/QueriesPage.js'
import {QueriesSelectMachine} from './js/QueriesModules/QueriesSelectMachine.js'
import axios from 'axios';
import {Card, Button} from 'react-materialize'
import $ from 'jquery';
import {MainPage} from './main.js';

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

const machinesQueries = ['maquina1', 'maquina2', 'maquina3', 'maquina4'];
const machinesData = ['maquina1', 'maquina2'];

class SelectedPage extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			preguntasSelected: true,
			// infoSensores: [],
			selectedPage: 'preguntas',
			errorLoading: false,
		};
	}

	componentDidMount(){
		$('.button-collapse').sideNav({
			menuWidth: 300, // Default is 300
		  	edge: 'left', // Choose the horizontal origin
		  	closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
		  	draggable: true, // Choose whether you can drag to open on touch screens,
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
		// const infoSensores = this.state.infoSensores;
		// const errorLoading = this.state.errorLoading;

		// const cargando = (selectedPage === 'cargando' && !errorLoading)
		// 	? (<Card s={12} l={8} offset='l2' title="Cargando datos..." className='center'>
		// 		<img className='loading' alt='Cargando...'
		// 				src={require('./img/loading_bars.gif')}
		// 			/>
		// 		</Card>)
		// 	: (null);
		//
		// const cardError = (selectedPage === 'cargando' && errorLoading) &&
		// 	(<Card s={12} l={8} offset='l2' title="Error al cargar datos" className='center'>
		// 		<p>Ha ocurrido un error al cargar los datos necesarios desde el servidor.</p>
		// 		<p>Vuelva a cargar la página para intentar solucionarlo.</p>
		// 	</Card>);

		const queries = (selectedPage === 'preguntas') &&
			// (<SensorsInfo infoSensores={infoSensores}/>);
			(<QueriesSelectMachine machines={machinesQueries}/>);

		const datos = (selectedPage === 'datos') &&
			// (<ParseData infoSensores={infoSensores}/>);
			(<DataSelectMachine machines={machinesData}/>);

		let preguntasClass = '';
		let traductorClass = '';

		if (selectedPage === 'preguntas'){
			preguntasClass = preguntasClass + 'active ';
		}

		if (selectedPage === 'datos'){
			traductorClass = traductorClass + 'active ';
		}

		const navBarTitle = (preguntasSelected) ? "Consultar de datos de sensores" : "Insertar datos de sensores";

		const navBar =
		// (selectedPage === 'cargando')
			// ? (
			// 		<div className="nav-wrapper">
			// 			<a href="#" className="brand-logo center">Análisis de datos de sensores</a>
			// 		</div>)
			(
					<div className="nav-wrapper">
						<a href="#" className="brand-logo center">{navBarTitle}</a>
						<ul className="left">
							<li>
								<Button data-activates="slide-out" className="button-collapse show-on-medium-and-up btn-flat white-text">
									<i className="material-icons">menu</i>
								</Button>
								{/* <a href="#" data-activates="slide-out" className="button-collapse show-on-medium-and-up">
									<i className="material-icons">menu</i>
								</a> */}
							</li>
						</ul>
					</div>);

		const sideNav = (<ul id="slide-out" className="side-nav">
			<li className="blue darken-3">
				<div className="user-view">
					<a href="#!user" className="margin-left">
						<img className="circle margin-top" src={require('./img/user.png')} height="100%"/>
					</a>
					<a href="#!email" className='margin-top'>
						<span className="white-text email">example@example.com</span>
					</a>
				</div>
			</li>
			<li>
				<a href="#" className={preguntasClass} onClick={() => this.mostrarPreguntas()}>
					<i className="material-icons pink-text text-darken-3">bar_chart</i>
					Consultar datos
				</a>
			</li>
			<li>
				<a href="#" className={traductorClass} onClick={() => this.mostrarTraductorDatos()}>
					<i className="material-icons yellow-text text-darken-3">publish</i>
					Insertar datos
				</a>
			</li>
		</ul>);

		const navColor = (preguntasSelected) ? ('pink darken-3') : ('yellow darken-3')

		return(
			<div>
				<div className='navBar'>
					<nav className={navColor}>
					    {navBar}
						{sideNav}
					</nav>
				</div>
				<div className='container'>
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
