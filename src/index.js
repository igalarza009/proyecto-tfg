// index.js

// <div>Icons made by <a href="https://www.flaticon.com/authors/epiccoders" title="EpicCoders">EpicCoders</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {ParseData} from './js/DataModules/DataPage.js'
import M from 'materialize-css';
import {SensorsInfo} from './js/QueriesModules/QueriesPage.js'

class SelectedPage extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			preguntasSelected: true,
		};
	}

	mostrarPreguntas(){
		this.setState({
			preguntasSelected: true,
		});
	}

	mostrarTraductorDatos(){
		this.setState({
			preguntasSelected: false,
		});
	}

	render(){
		const preguntasSelected = this.state.preguntasSelected;

		const contenido = preguntasSelected
			? (<SensorsInfo />)
			: (<ParseData />);

		const preguntasClass = preguntasSelected
			? ("active")
			: ("");

		const traductorClass = preguntasSelected
			? ("")
			: ("active");

		return(
			<div>
				<div className='navBar'>
					<nav className='blue darken-3'>
					    <div className="nav-wrapper">
					      	<a href="#" className="brand-logo center">Información sobre sensores</a>
					       	<ul id="nav-mobile" className="left hide-on-med-and-down">
					        	<li className={preguntasClass}><a href="#" onClick={() => this.mostrarPreguntas()}>Preguntas</a></li>
					        	<li className={traductorClass}><a href="#" onClick={() => this.mostrarTraductorDatos()}>Traductor datos</a></li>
					      	</ul>
					    </div>
					</nav>
				</div>
				<div className='container'>
					{contenido}
				</div>
			</div>
		)
	}
}

ReactDOM.render(
	<SelectedPage />,
  	document.getElementById('root')
);
