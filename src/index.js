// index.js

// <div>Icons made by <a href="https://www.flaticon.com/authors/epiccoders" title="EpicCoders">EpicCoders</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {ParseData} from './SemanticModule/DataModules/DataPage.js'
import {DataSelectMachine} from './SemanticModule/DataModules/DataSelectMachine.js'
import M from 'materialize-css';
import {SensorsInfo} from './SemanticModule/QueriesModules/QueriesPage.js'
import {QueriesSelectMachine} from './SemanticModule/QueriesModules/QueriesSelectMachine.js'
import axios from 'axios';
import {Card, Button} from 'react-materialize'
import $ from 'jquery';
// import {MainPage} from './main.js';

// const machinesQueries = ['maquina1', 'maquina2', 'maquina3', 'maquina4'];
// const machinesData = ['maquina1', 'maquina2'];

const idOrg = '-L2PV1Ya30YR-SBlesmI';

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

		const queries = (selectedPage === 'preguntas') &&
			// (<SensorsInfo infoSensores={infoSensores}/>);
			(<QueriesSelectMachine idOrganization={idOrg}/>);

		const datos = (selectedPage === 'datos') &&
			// (<ParseData infoSensores={infoSensores}/>);
			(<DataSelectMachine idOrganization={idOrg}/>);

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
						<img className="circle margin-top" src={require('./SemanticModule/img/user.png')} height="100%"/>
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
				{/* <div className='container'> */}
					{queries}
					{datos}
				{/* </div> */}
			</div>
		)
	}
}

ReactDOM.render(
	<SelectedPage />,
  	document.getElementById('root')
);
