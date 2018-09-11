// index.js
// ----------------------------------------------
// Esta página no entra dentro de la unión.
// Será sustituída por el index.js de I4TSPS.
// ----------------------------------------------

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {DataSelectMachine} from './SemanticModule/DataModules/DataSelectMachine.js'
// import M from 'materialize-css';
import {QueriesSelectMachine} from './SemanticModule/QueriesModules/QueriesSelectMachine.js'
import {Button} from 'react-materialize'
import $ from 'jquery';

const idOrg = '-L2PV1Ya30YR-SBlesmI';

// ----------- CAMBIAR EN LA UNIÓN CON I4TSPS ---------
const imgPath = './img/';
// ----------------------------------------------------

class SelectedPage extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			preguntasSelected: true,
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
			(<QueriesSelectMachine idOrganization={idOrg}/>);

		const datos = (selectedPage === 'datos') &&
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
			(
					<div className="nav-wrapper">
						<a href="#" className="brand-logo center">{navBarTitle}</a>
						<ul className="left">
							<li>
								<Button data-activates="slide-out" className="button-collapse show-on-medium-and-up btn-flat white-text">
									<i className="material-icons">menu</i>
								</Button>
							</li>
						</ul>
					</div>);

		const sideNav = (<ul id="slide-out" className="side-nav">
			<li className="blue darken-3">
				<div className="user-view">
					<a href="#!user" className="margin-left">
						<img className="circle margin-top" src={`${imgPath}user.png`} height="100%"/>
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
					<i className="material-icons green-text text-darken-3">publish</i>
					Insertar datos
				</a>
			</li>
		</ul>);

		const navColor = (preguntasSelected) ? ('pink darken-3') : ('green darken-3')

		return(
			<div>
				<div className='navBar'>
					<nav className={navColor}>
					    {navBar}
						{sideNav}
					</nav>
				</div>
				{queries}
				{datos}
			</div>
		)
	}
}

ReactDOM.render(
	<SelectedPage />,
  	document.getElementById('root')
);
