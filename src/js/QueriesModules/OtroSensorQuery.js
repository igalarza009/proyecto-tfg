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
			knownSensors:{},
			selectedSensors: [this.props.selectedSensors],
			askedSensors: [this.props.selectedSensors[0]],
			quitarAnomalias: false,
		};
	}

	static getDerivedStateFromProps(props, state){
        if (!_.isEqual(props.selectedSensors, state.selectedSensors)){
			let knownSensors = state.knownSensors;
			let newKnownSensors = {};
			let askedSensors = state.askedSensors;
			let newAskedSensors = [];
			let selectedSensors = props.selectedSensors;
			selectedSensors.forEach((value,i) => {
				if (askedSensors.indexOf(value) !==-1){
					newAskedSensors.push(value);
				}
				else if (!knownSensors[value]){
					newKnownSensors[value] = 0;
				}
				else{
					newKnownSensors[value] = knownSensors[value];
				}
			});
			return {
				selectedSensors: selectedSensors,
				knownSensors: newKnownSensors,
				askedSensors: newAskedSensors,
			};
		}
    }

	handleCheckedSensor(event){
		const value = event.target.value;
		let askedSensors = this.state.askedSensors.slice();
		let knownSensors = this.state.knownSensors;
		const iAskedSensor = askedSensors.indexOf(value);
		let newKnownSensors = knownSensors;
		if ( iAskedSensor !== -1){
			askedSensors.splice(iAskedSensor, 1);
			newKnownSensors[value] = 0;
		}
		else{
			askedSensors.push(value);
			newKnownSensors = _.omit(knownSensors, [value]);
		}
		this.setState({
			askedSensors: askedSensors,
			knownSensors: newKnownSensors,
		});
		console.log("askedSensors: " + JSON.stringify(askedSensors));
		console.log("knownSensors: " + JSON.stringify(knownSensors));
	}

	handleValueChange(event, sensorId){
		let value = event.target.value;
		let knownSensors = this.state.knownSensors;
		if (value === ""){
			knownSensors[sensorId] = 0;
		}
		else{
			knownSensors[sensorId] = parseFloat(value);
		}
		this.setState({
			knownSensors: knownSensors,
		});
	}

	handleSelectChange(event, sensorId){
		let value = event.target.value;
		let knownSensors = this.state.knownSensors;
		if (value === 'esp'){
			knownSensors[sensorId] = 0;
		}
		else{
			knownSensors[sensorId] = value;
		}
		this.setState({
			knownSensors: knownSensors,
		});
	}

	handleElimAnom(event){
		const quitarAnomalias = this.state.quitarAnomalias;
		this.setState({
			quitarAnomalias: !quitarAnomalias,
		});
	}

	handleSubmit(){
		const knownSensors = this.state.knownSensors;
		const askedSensors = this.state.askedSensors.slice();
		const quitarAnomalias = this.state.quitarAnomalias;

		this.props.getOtherSensorQuery(knownSensors, askedSensors, quitarAnomalias);
	}

	render(){
		const selectedSensors = this.state.selectedSensors.slice();
		const askedSensors = this.state.askedSensors.slice();
		const knownSensors = this.state.knownSensors;

		const checkboxesSensores = selectedSensors.map((sensorId, i) => {
			const sensor = _.find(infoSensores, ['indicatorId', sensorId]);
			const defChecked = (i === 0)
				? (true)
				: (false);
			const checkValue = sensorId + ' (' + sensor.name + ')';
			return(
				<Input s={12} key={sensorId} name='checkboxesSensores'
					type='checkbox' value={sensorId} label={checkValue}
					className='filled-in' checked={defChecked}
					onChange={(e) => {this.handleCheckedSensor(e);}}
				/>
			);
		});

		let restoSensores = selectedSensors.map((sensorId, i) => {
			if (askedSensors.indexOf(sensorId) === -1){
				let sensor = _.find(infoSensores, ['indicatorId', sensorId]);
				let sensorName = sensorId + ' (' + sensor.name + ')';
				const valueInput = (isNaN(knownSensors[sensorId]))
					? (null)
					: (<Input s={3} label="Valor"
							onChange={(e) => {this.handleValueChange(e,sensorId);}}
						/>);
				return(
					<Row key={sensorId}>
						<Col s={12}>
							<p>El sensor {sensorName} tenga: </p>
						</Col>
						<Input s={6} type='select' defaultValue='esp'
							onChange={(e) => {this.handleSelectChange(e,sensorId);}}
						>
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
						<p className='grey-text'>
							Comprobar los valores que toman ciertos de los sensores
							seleccionados cuando el resto toman unos valores determinados.
						</p>
					</Row>
					<Row>
						<p className='blue-text text-darken-3'>
							Sensor/es a preguntar:
						</p>
					</Row>
					<Row>
						{checkboxesSensores}
					</Row>
					<Row>
						<p className='blue-text text-darken-3'>
							Qué valores tomarán estos sensores cuando...
						</p>
					</Row>
					{restoSensores}
					<Row>
						<p className='blue-text text-darken-3'>
							¿Eliminar anomalías? (solo se mostrarán valores entre 1 y 3000)
						</p>
					</Row>
					<Row>
						<Input s={12} name='checkboxesSensores'
							type='checkbox' value='elimAnom'
							label='Eliminar anomalías' className='filled-in'
							onChange={(e) => {this.handleElimAnom(e);}}
						/>
					</Row>
					<Row className='center-align'>
						<Button className='blue darken-3' type='submit'
							name='action' onClick={() => {this.handleSubmit();}}
						>
							Consultar <Icon right>bar_chart</Icon>
		   				</Button>
					</Row>
				</div>
			</Card>
		)
	}
}
