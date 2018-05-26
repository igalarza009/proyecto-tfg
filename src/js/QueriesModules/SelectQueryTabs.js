import React from 'react';
import '../../index.css';
import M from 'materialize-css';
import $ from 'jquery';
import {InformationQueryForm} from './InformationQuery.js'
import {OtroSensorQueryForm} from './OtroSensorQuery.js'

export class PruebaTabsMat extends React.Component {
	componentDidMount(){
		$(document).ready(function(){
			$('ul.tabs').tabs();
		});
	}

	render(){
		const selectedSensors = this.props.selectedSensors;
		const moreThanOneSensor = this.props.moreThanOneSensor;

		const classNames = (moreThanOneSensor)
			? ("tab col s4")
			: ("tab col s4 disabled");

		return(
			<div className='selectQuery'>
				<div className="row">
				<div className="col s12">
					 <ul className="tabs tabs-fixed-width">
						 <li className="tab col s4"><a className="active" href="#infor">Información</a></li>
						 <li className={classNames}><a href="#otro">Otro sensor</a></li>
						 <li className={classNames}><a href="#anom">Anomalias</a></li>
					 </ul>
				 </div>
				 <div id="infor" className="col s12">
					 <InformationQueryForm
             selectedSensors={selectedSensors}
             getInformationQuery={(s,g,f,o) => {this.props.getInformationQuery(s,g,f,o);}}
           />
				 </div>
				 <div id="otro" className="col s12">
					 <OtroSensorQueryForm
             selectedSensors={selectedSensors}
             getOtherSensorQuery={(k,a,q,o) => {this.props.getOtherSensorQuery(k,a,q,o);}}
           />
				 </div>
				 <div id="anom" className="col s12">
					 Anomalías
				 </div>
			 </div>
		 </div>
		)
	}
}
