import React from 'react';
import '../../index.css';
import {Button, Icon, Row, Col, Card, Input} from 'react-materialize'
import M from 'materialize-css';
import $ from 'jquery';

var _ = require('lodash');
const infoSensores = require('../../infoSensores.json');

export class OtroSensorQueryForm extends React.Component{
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
		console.log(knownSensorIds);
		console.log(values);
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

		let knownSensors = {};
		knownSensorIds.forEach((value,i) => {
			knownSensors[value] = knownSensorValues[i];
		});

		this.props.getOtherSensorQuery(knownSensors, askedSensors, quitarAnomalias);
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
