import React from 'react';
import '../../index.css';
import {Button, Icon, Row, Col, Card, Input} from 'react-materialize'
import M from 'materialize-css';
import $ from 'jquery';
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

var _ = require('lodash');
const infoSensores = require('../../infoSensores.json');

export class OtroSensorQueryForm extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			knownSensors:{},
			selectedSensors: this.props.selectedSensors,
			askedSensors: [this.props.selectedSensors[0]],
			quitarAnomalias: false,
			filterValues: [],
			values: {},
		};
	}

	static getDerivedStateFromProps(props, state){
        if (!_.isEqual(props.selectedSensors, state.selectedSensors)){
			const knownSensors = state.knownSensors;
			let newKnownSensors = {};
			const askedSensors = state.askedSensors;
			let newAskedSensors = [];
			const filterValues = state.filterValues;
			let newFilterValues = [];
			const selectedSensors = props.selectedSensors;
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
				if (filterValues[value]){
					newFilterValues.push(value);
				}
			});
			return {
				selectedSensors: selectedSensors,
				knownSensors: newKnownSensors,
				askedSensors: newAskedSensors,
				filterValues: newFilterValues,
			};
		}
		else{
			return null;
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

	handleRange(range, sensorId){
		let values = this.state.values;
		values[sensorId] = range;
		this.setState({
			values: values,
		});
		// console.log(values);

	}

	handleFilterValueChecked(event, sensorId, min, max){
		let values = this.state.values;
		let checked = event.target.checked;
		let filterValues = this.state.filterValues;
		if (checked){
			filterValues.push(sensorId);
			if (!values[sensorId]){
				values[sensorId] = [min, max];
			}
		}
		else{
			let iSensor = filterValues.indexOf(sensorId);
			filterValues.splice(iSensor,1);
		}
		this.setState({
			values: values,
			filterValues: filterValues,
		});
		console.log(filterValues);
		console.log(values);
	}

	handleSubmit(){
		const knownSensors = this.state.knownSensors;
		const askedSensors = this.state.askedSensors.slice();
		const values = this.state.values;
		const stateFilterValues = this.state.filterValues;
		// const quitarAnomalias = this.state.quitarAnomalias;

		let filterValues = {'filter': false, 'values': {}};

		if (stateFilterValues.length > 0){
			filterValues['filter'] = true;
			stateFilterValues.forEach((sensorId) => {
				filterValues['values'][sensorId] = values[sensorId];
			});
		}

		this.props.getOtherSensorQuery(knownSensors, askedSensors, filterValues);
	}

	render(){
		const selectedSensors = this.state.selectedSensors.slice();
		const askedSensors = this.state.askedSensors.slice();
		const knownSensors = this.state.knownSensors;
		const filterValues = this.state.filterValues;
		const values = this.state.values;

		const Slider = require('rc-slider');
		const createSliderWithTooltip = Slider.createSliderWithTooltip;
		const Range = createSliderWithTooltip(Slider.Range);

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
				const sensor = _.find(infoSensores, ['indicatorId', sensorId]);
				const sensorName = sensorId + ' (' + sensor.name + ')';
				const minValue = sensor["minValue"];
				const maxValue = sensor["maxValue"];
				const disabled = (filterValues.indexOf(sensorId) === -1)
					? (true)
					: (false);
				const defaultRange = (!values[sensorId])
					? ([minValue, maxValue])
					: ([values[sensorId][0], values[sensorId][1]]);
				const valueInput = (isNaN(knownSensors[sensorId]))
						? (null)
						: (<Input s={3} label="Valor"
								onChange={(e) => {this.handleValueChange(e,sensorId);}}
							/>);
				const valuePickerType = (sensor['resultType'] === 'DoubleValueResult')
						? (<Range
								min={minValue} max={maxValue}
								defaultValue={defaultRange}
								disabled={disabled}
								onAfterChange={(e) => {this.handleRange(e,sensorId);}}
							/>)
						: (<div className="switch">
								<label>
									Off
									<input type="checkbox" disabled={disabled}
										onChange={(e) => {this.handleSwitch(e,sensorId);}}
									/>
									<span className="lever"></span>
									On
								</label>
							</div>);
				const showFilterValues = (isNaN(knownSensors[sensorId]))
						? (<div>
								<Col s={12}>
									<Input name='filterValue' type='checkbox' className='filled-in'
										label="Filtrar valores para evitar anomalías"
										onChange={(e) => {this.handleFilterValueChecked(e,sensorId,minValue,maxValue);}}
									/>
								</Col>
								<Col s={10} offset="s1">
									{valuePickerType}
								</Col>
							</div>)
						: (null);
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
						{showFilterValues}
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
					{/* <Row>
						<p className='blue-text text-darken-3'>
							Filtrar rango valores para evitar anomalías
						</p>
					</Row>
					<Row>
						<Input s={12} name='checkboxesSensores'
							type='checkbox' value='elimAnom'
							label='Eliminar anomalías' className='filled-in'
							onChange={(e) => {this.handleElimAnom(e);}}
						/>
					</Row> */}
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
