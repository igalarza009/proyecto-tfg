import React from 'react';
import '../../index.css';
import {Button, Icon, Row, Col, Card, Input} from 'react-materialize'
import M from 'materialize-css';
import $ from 'jquery';

var _ = require('lodash');
const infoSensores = require('../../infoSensores.json');

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
					 <InformationQueryForm selectedSensors={selectedSensors} getInformationQuery={(s,g,f,o) => {this.props.getInformationQuery(s,g,f,o);}}/>
				 </div>
				 <div id="otro" className="col s12">
					 <OtroSensorQueryForm selectedSensors={selectedSensors} getOtherSensorQuery={(k,a,q,o) => {this.props.getOtherSensorQuery(k,a,q,o);}}/>
				 </div>
				 <div id="anom" className="col s12">
					 Anomalías
				 </div>
			 </div>
		 </div>
		)
	}
}

class InformationQueryForm extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			fechaInicio: '',
			fechaFin: '',
			horaInicio: '',
			horaFin: '',
			selectAggregates: {'avg':false, 'min':false, 'max':false},
			groupBy: 'day'
		};
	}

	handleFechaInicio(event, value){
		this.setState({
			fechaInicio: value,
		});
	}

	handleFechaFin(event, value){
		this.setState({
			fechaFin: value,
		});
	}

	handleHoraInicio(event,value){
		this.setState({
			horaInicio: value,
		});
	}

	handleHoraFin(event,value){
		this.setState({
			horaFin: value,
		});
	}

	handleAggregates(event){
		let selectAggregates = this.state.selectAggregates;
		let groupBy = this.state.groupBy;
		const checked = event.target.checked;
		const value = event.target.value;

		if (checked && groupBy === ''){
			groupBy = 'all';
		}

		selectAggregates[value] = !selectAggregates[value];
		this.setState({
			selectAggregates: selectAggregates,
			groupBy: groupBy,
		});
	}

	handleGroupBy(event){
		const value = event.target.value;
		this.setState({
			groupBy: value,
		});
	}

	handleSubmit(){
		const sensors = this.props.selectedSensors;
		let groupBy = {'groupBy':false, 'groupByDate':false, 'groupByHour':false, 'groupByAll': false, 'avg':false, 'min':false, 'max':false};
		let filter = {'filter':false, 'filterDate':false, 'startDate':'', 'endDate':'', 'filterTime':false, 'startTime':'', 'endTime':''};
		let orderBy = {'orderBy':true, 'order':'desc', 'orderField':'dateTime'};

		const fechaInicio = this.state.fechaInicio;
		const fechaFin = this.state.fechaFin;
		const horaInicio = this.state.horaInicio;
		const horaFin = this.state.horaFin;
		const selectAggregates = this.state.selectAggregates;
		const groupByState = this.state.groupBy;

		if (fechaInicio !== ''){
			filter['filter'] = true;
			filter['filterDate'] = true;
			filter['startDate'] = fechaInicio;
			filter['endDate'] = fechaFin;
		}

		if (horaInicio !== ''){
			filter['filter'] = true;
			filter['filterTime'] = true;
			filter['startTime'] = horaInicio;
			filter['endTime'] = horaFin;
		}

		if (_.includes(selectAggregates, true)){
			groupBy['groupBy'] = true;
			groupBy['avg'] = selectAggregates['avg'];
			groupBy['min'] = selectAggregates['min'];
			groupBy['max'] = selectAggregates['max'];
			if (groupByState === 'day'){
				groupBy['groupByDate'] = true;
			}
			else if (groupByState === 'hour'){
				groupBy['groupByHour'] = true;
			}
			else{
				groupBy['groupByAll'] = true;
			}
		}

		this.props.getInformationQuery(sensors, groupBy, filter, orderBy);
	}

	render(){
		const groupBy = this.state.groupBy;
		let groupByDisabled = (groupBy === '')
			? (true)
			: (false);

		return(
			<Card>
				<div className='form'>
					<Row>
						<p className='grey-text'> Obtener una gráfica sobre los valores que toman los sensores selecionados. Completa solo los campos deseados para aplicar filtros a la respuesta. </p>
					</Row>
					<Row s={12}>
						<p className='blue-text text-darken-3'>Filtrar resultados por fechas: </p>
					</Row>
					<Row>
						<Col s={12} l={6}>
							<Input type='date' label="Desde..." options={{format: 'yyyy-mm-dd'}} onChange={(e, value) => {this.handleFechaInicio(e, value);}} />
						</Col>
						<Col s={12} l={6}>
							<Input type='date' label="Hasta..." options={{format: 'yyyy-mm-dd'}} onChange={(e, value) => {this.handleFechaFin(e, value);}} />
						</Col>
					</Row>
					<Row s={12}>
						<p className='blue-text text-darken-3'>Filtrar resultados por horas: </p>
					</Row>
					<Row>
						<Col s={12} l={6}>
							<Input name='hora1' type='text'  label="Desde las... (HH:mm:ss)" onChange={(e, value) => {this.handleHoraInicio(e, value);}}/>
						</Col>
						<Col s={12} l={6}>
							<Input name='hora2' type='text'  label="Hasta las... (HH:mm:ss)" onChange={(e, value) => {this.handleHoraFin(e, value);}}/>
						</Col>
					</Row>
					<Row s={12}>
						<p className='blue-text text-darken-3'>Agrupar resultados para mostrar: </p>
					</Row>
					<Row>
						<Col s={12}>
							<Input name='groupBy' type='checkbox' className='filled-in' value='avg' label='Valor medio del sensor (AVG)' onChange={(e) => {this.handleAggregates(e);}}/>
						</Col>
						<Col s={12}>
							<Input name='groupBy' type='checkbox' className='filled-in' value='max' label='Valor máximo del sensor (MAX)' onChange={(e) => {this.handleAggregates(e);}}/>
						</Col>
						<Col s={12}>
							<Input name='groupBy' type='checkbox' className='filled-in' value='min' label='Valor mínimo del sensor (MIN)' onChange={(e) => {this.handleAggregates(e);}}/>
						</Col>
						<Col s={12}>
							<Input s={12} type='select' defaultValue='day' onChange={(e) => {this.handleGroupBy(e);}} disabled={groupByDisabled}>
								<option value='day'>Cada día</option>
								<option value='hour'>Cada hora</option>
								<option value='all'>Valor absoluto en todo el intervalo</option>
							</Input>
						</Col>
					</Row>
					<Row className='center-align'>
						<Button className='blue darken-3' type='submit' name='action' onClick={() => {this.handleSubmit();}}>
							Consultar <Icon right>bar_chart</Icon>
		   				</Button>
					</Row>
				</div>
			</Card>
		)
	}
}

class OtroSensorQueryForm extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			knownSensorIds: [],
			knownSensorValues: [],
			askedSensors: [this.props.selectedSensors[0]],
			quitarAnomalias: false,
		};
	}

	componentDidMount(){
		let knownSensorIds = this.state.knownSensorIds;
		let values = [];
		this.props.selectedSensors.forEach((value,i) => {
			if  (i !== 0){
				knownSensorIds.push(value);
				values.push(0);
			}
		});
		this.setState({
			knownSensorIds: knownSensorIds,
			knownSensorValues: values,
		});
	}

	handleCheckedSensor(event){
		const value = event.target.value;
		const askedSensors = this.state.askedSensors.slice();
		const knownSensorIds = this.state.knownSensorIds.slice();
		const knownSensorValues = this.state.knownSensorValues.slice();
		const iAskedSensor = askedSensors.indexOf(value);
		if ( iAskedSensor !== -1){
			askedSensors.splice(iAskedSensor, 1);
			knownSensorIds.push(value);
			knownSensorValues.push(0);
		}
		else{
			askedSensors.push(value);
			let iKnownSensor = knownSensorIds.indexOf(value);
			knownSensorIds.splice(iKnownSensor, 1);
			knownSensorValues.splice(iKnownSensor, 1);
		}
		this.setState({
			askedSensors: askedSensors,
			knownSensorIds: knownSensorIds,
			knownSensorValues: knownSensorValues,
		});
	}

	handleValueChange(event, sensorId){
		let value = event.target.value;
		let knownSensorIds = this.state.knownSensorIds;
		let knownSensorValues = this.state.knownSensorValues.slice();
		let iSensor = knownSensorIds.indexOf(sensorId);
		if (value === ""){
			knownSensorValues[iSensor] = 0;
		}
		else{
			knownSensorValues[iSensor] = parseFloat(value);
		}
		this.setState({
			knownSensorValues: knownSensorValues,
		});
	}

	handleSelectChange(event, sensorId){
		let value = event.target.value;
		let knownSensorIds = this.state.knownSensorIds;
		let knownSensorValues = this.state.knownSensorValues.slice();
		let iSensor = knownSensorIds.indexOf(sensorId);
		if (value === 'esp'){
			knownSensorValues[iSensor] = 0;
		}
		else{
			knownSensorValues[iSensor] = value;
		}
		this.setState({
			knownSensorValues: knownSensorValues,
		});
	}

	handleElimAnom(event){
		const quitarAnomalias = this.state.quitarAnomalias;
		this.setState({
			quitarAnomalias: !quitarAnomalias,
		});
	}

	handleSubmit(){
		const knownSensorValues = this.state.knownSensorValues.slice();
		const knownSensorIds = this.state.knownSensorIds.slice();
		const askedSensors = this.state.askedSensors.slice();
		const quitarAnomalias = this.state.quitarAnomalias;;
		const orderByDate = true;

		let knownSensors = {};
		knownSensorIds.forEach((value,i) => {
			knownSensors[value] = knownSensorValues[i];
		});

		this.props.getOtherSensorQuery(knownSensors, askedSensors, quitarAnomalias, orderByDate);
	}



	render(){
		const selectedSensors = this.props.selectedSensors;
		const askedSensors = this.state.askedSensors.slice();
		const knownSensorIds = this.state.knownSensorIds.slice();
		const knownSensorValues = this.state.knownSensorValues.slice();

		const checkboxesSensores = selectedSensors.map((value, i) => {
			const sensor = _.find(infoSensores, ['indicatorId', value]);
			// const sensorName = sensor.name;
			const defChecked = (i === 0)
				? (true)
				: (false);
			const checkValue = value + ' (' + sensor.name + ')';
			return(
				<Input s={12} key={value} name='checkboxesSensores' type='checkbox' value={value} label={checkValue} className='filled-in' checked={defChecked} onChange={(e) => {this.handleCheckedSensor(e);}}/>
			);
		});

		let restoSensores = selectedSensors.map((value, i) => {
			if (askedSensors.indexOf(value) === -1){
				let sensor = _.find(infoSensores, ['indicatorId', value]);
				let sensorName = value + ' (' + sensor.name + ')';
				let iSensor = knownSensorIds.indexOf(value);
				let valueInput = (isNaN(knownSensorValues[iSensor]))
					? (null)
					: (<Input s={3} label="Valor" onChange={(e) => {this.handleValueChange(e,value);}}/>);
				return(
					<Row key={value}>
						<Col s={12}>
							<p>El sensor {sensorName} tenga: </p>
						</Col>
						<Input s={6} type='select' defaultValue='esp' onChange={(e) => {this.handleSelectChange(e,value);}}>
							<option value='esp'>Valor específico</option>
							<option value='min'>Valor mínimo</option>
							<option value='max'>Valor máximo</option>
						</Input>
						{valueInput}
					</Row>
				);
			}
			else{
				return null;
			}
		});

		return(
			<Card>
				<div className='form'>
					<Row>
						<p className='grey-text'>Comprobar los valores que toman ciertos de los sensores seleccionados cuando el resto toman unos valores determinados. </p>
					</Row>
					<Row>
						<p className='blue-text text-darken-3'>Sensor/es a preguntar: </p>
					</Row>
					<Row>
						{checkboxesSensores}
					</Row>
					<Row>
						<p className='blue-text text-darken-3'>Qué valores tomarán estos sensores cuando... </p>
					</Row>
					{restoSensores}
					<Row>
						<p className='blue-text text-darken-3'>¿Eliminar anomalías? (solo se mostrarán valores entre 1 y 3000) </p>
					</Row>
					<Row>
						<Input s={12} name='checkboxesSensores' type='checkbox' value='elimAnom' label='Eliminar anomalías' className='filled-in' onChange={(e) => {this.handleElimAnom(e);}}/>
					</Row>
					<Row className='center-align'>
						<Button className='blue darken-3' type='submit' name='action' onClick={() => {this.handleSubmit();}}>
							Consultar <Icon right>bar_chart</Icon>
		   				</Button>
					</Row>
				</div>
			</Card>
		)
	}
}
