import React from 'react';
import '../../index.css';
import M from 'materialize-css';
import $ from 'jquery';
import {Icon} from 'react-materialize'
import {InformationQueryForm} from './InformationQuery.js'
import {OtroSensorQueryForm} from './OtroSensorQuery.js'
import {AnomaliasQueryForm} from './AnomaliasQuery.js'

export class PruebaTabsMat extends React.Component {

	componentDidMount(){
		$(document).ready(function(){
			$('ul.tabs').tabs();
			$('.tooltipped').tooltip({delay: 50});
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
						 <li className="tab col s4">
							 <a className="active" href="#infor">Información
								 {/* <i className="tiny grey-text material-icons tooltipped infoTabs"
									 data-position="bottom"
									 data-tooltip="I am a tooltip">
									 info
								 </i> */}
							 </a>
						 </li>
						 <li className={classNames}><a href="#otro">Otro sensor</a></li>
						 <li className={classNames}><a href="#anom">Anomalias</a></li>
					 </ul>
				 </div>
				 <div id="infor" className="col s12">
					 <InformationQueryForm
			             selectedSensors={selectedSensors}
			             getInformationQuery={(s,g,f,fv) => {this.props.getInformationQuery(s,g,f,fv);}}
						 infoSensores={this.props.infoSensores}
			         />
				 </div>
				 <div id="otro" className="col s12">
					 <OtroSensorQueryForm
			             selectedSensors={selectedSensors}
			             getOtherSensorQuery={(k,a,v,f) => {this.props.getOtherSensorQuery(k,a,v,f);}}
						 infoSensores={this.props.infoSensores}
			         />
				 </div>
				 <div id="anom" className="col s12">
					 <AnomaliasQueryForm
			             selectedSensors={selectedSensors}
						 getAnomaliasQuery={(s,p) => {this.props.getAnomaliasQuery(s,p);}}
						 infoSensores={this.props.infoSensores}
			         />
				 </div>
			 </div>
		 </div>
		)
	}
}
