import React from 'react';
import '../../index.css';
import {Button, Icon, Row, Col, Card, Input} from 'react-materialize'
import M from 'materialize-css';
import $ from 'jquery';
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

var _ = require('lodash');
// const infoSensores = require('../../infoSensores.json');

export class OtroSensorQueryForm extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			knownSensors:{},
			selectedSensors: [],
			askedSensors: [],
			quitarAnomalias: false,
			filterValues: [],
			values: {},
			fechaInicio: '',
			fechaFin: '',
			errores: {
				fechasMal:false,
				faltaFecha: false,
			},
		};
	}

	// componentDidMount(){
	// 	// const askedSensors = this.state.askedSensors;
	// 	// const selectedSensors = this.state.selectedSensors;
	// 	// const knownSensors = this.state.knownSensors;
	// 	// // let newKnownSensors = {};
	// 	// // selectedSensors.forEach((value,i) => {
	// 	// // 	if (askedSensors.indexOf(value) === -1){
	// 	// // 		newKnownSensors[value] = null;
	// 	// // 	}
	// 	// // });
	// 	// //
	// 	// // this.setState({
	// 	// // 	knownSensors: newKnownSensors,
	// 	// // });
	// 	// console.log(askedSensors);
	// 	// console.log(knownSensors);
	// 	this.setState({
	// 		selectedSensors: this.props.selectedSensors,
	// 		askedSensors: [this.props.selectedSensors[0]],
	// 	})
	// }

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
				if (state.selectedSensors.length === 0){
					newAskedSensors.push(value);
				}
				else{
					if (askedSensors.indexOf(value) !==-1){
						newAskedSensors.push(value);
					}
					else if (!knownSensors[value]){
						newKnownSensors[value] = null;
					}
					else{
						newKnownSensors[value] = knownSensors[value];
					}
					if (filterValues[value]){
						newFilterValues.push(value);
					}
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
			newKnownSensors[value] = null;
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
			knownSensors[sensorId] = null;
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
			knownSensors[sensorId] = null;
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

	handleFechaInicio(event, value){
		const fechaFin = this.state.fechaFin;
		var errores = this.state.errores;
		var fechasMal = false;
		var faltaFecha = false;
		if (value !== ''){
			if (fechaFin === ''){
				faltaFecha = true;
			}
			else{
				var dateInicio = new Date(value + 'T00:00:00');
				var dateFin = new Date(fechaFin + 'T00:00:00');
				if (dateInicio.getTime() > dateFin.getTime()){
					fechasMal = true;
				}
			}
		}
		else{
			if (fechaFin !== ''){
				faltaFecha = true;
			}
		}
		errores['fechasMal'] = fechasMal;
		errores['faltaFecha'] = faltaFecha;
		this.setState({
			fechaInicio: value,
			errores: errores,
		});
	}

	handleFechaFin(event, value){
		const fechaInicio = this.state.fechaInicio;
		var errores = this.state.errores;
		var fechasMal = false;
		var faltaFecha = false;
		if (value !== ''){
			if (fechaInicio === ''){
				faltaFecha = true;
			}
			else{
				var dateInicio = new Date(fechaInicio + 'T00:00:00');
				var dateFin = new Date(value + 'T00:00:00');
				if (dateInicio.getTime() > dateFin.getTime()){
					fechasMal = true;
				}
			}
		}
		else{
			if (fechaInicio !== ''){
				faltaFecha = true;
			}
		}
		errores['fechasMal'] = fechasMal;
		errores['faltaFecha'] = faltaFecha;
		this.setState({
			fechaFin: value,
			errores: errores,
		});
	}

	handleSubmit(){
		const knownSensors = this.state.knownSensors;
		const askedSensors = this.state.askedSensors.slice();
		const values = this.state.values;
		const stateFilterValues = this.state.filterValues;
		const fechaInicio = this.state.fechaInicio;
		const fechaFin = this.state.fechaFin;
		// const quitarAnomalias = this.state.quitarAnomalias;

		let filterValues = {'filter': false, 'values': {}};
		let filter = {'filter':false, 'filterDate':false, 'startDate':'', 'endDate':'', 'filterTime':false, 'startTime':'', 'endTime':''};

		if (stateFilterValues.length > 0){
			filterValues['filter'] = true;
			stateFilterValues.forEach((sensorId) => {
				filterValues['values'][sensorId] = values[sensorId];
			});
		}

		if (fechaInicio !== ''){
			filter['filter'] = true;
			filter['filterDate'] = true;
			filter['startDate'] = fechaInicio;
			filter['endDate'] = fechaFin;
		}

		// this.resetValues();

		this.props.getOtherSensorQuery(knownSensors, askedSensors, filterValues, filter);
	}

	render(){
		const selectedSensors = this.state.selectedSensors.slice();
		const askedSensors = this.state.askedSensors.slice();
		const knownSensors = this.state.knownSensors;
		const filterValues = this.state.filterValues;
		const values = this.state.values;
		const errores = this.state.errores;

		const Slider = require('rc-slider');
		const createSliderWithTooltip = Slider.createSliderWithTooltip;
		const Range = createSliderWithTooltip(Slider.Range);

		const checkboxesSensores = selectedSensors.map((sensorId, i) => {
			const sensor = _.find(this.props.infoSensores, ['indicatorId', sensorId]);
			const defChecked = (i === 0)
				? (true)
				: (false);
			const checkValue = sensor.name + ' (' + sensorId + ')';
			const sensorName = sensor.name;
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
				const sensor = _.find(this.props.infoSensores, ['indicatorId', sensorId]);
				const sensorName = sensor.name;
				const minValue = sensor["minValue"];
				const maxValue = sensor["maxValue"];
				const valorClass = (knownSensors[sensorId] === null)
					? ('error')
					: ('');
				const disabled = (filterValues.indexOf(sensorId) === -1)
					? (true)
					: (false);
				const defaultRange = (!values[sensorId])
					? ([minValue, maxValue])
					: ([values[sensorId][0], values[sensorId][1]]);
				const valueInput = (isNaN(knownSensors[sensorId]))
						? (null)
						: (<Input s={3} label="Valor" className={valorClass}
								onChange={(e) => {this.handleValueChange(e,sensorId);}}
							/>);
				const valuePickerType = (sensor['valueType'] === 'double')
						? (<Range
								min={minValue} max={maxValue}
								defaultValue={defaultRange}
								disabled={disabled}
								onAfterChange={(e) => {this.handleRange(e,sensorId);}}
							/>)
						: (<div className="switch">
								<label>
									Inactivo
									<input type="checkbox" disabled={disabled}
										onChange={(e) => {this.handleSwitch(e,sensorId);}}
									/>
									<span className="lever"></span>
									Activo
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
				const errorValor = (knownSensors[sensorId] === null)
					? (<p className='red-text'> Falta especificar el valor especifico del sensor.</p>)
					: (null);
				return(
					<Row key={sensorId}>
						<Col s={12}>
							<p>El sensor de <span className="bold">{sensorName}</span> ({sensorId}) tenga: </p>
						</Col>
						<Input s={6} type='select' defaultValue='esp'
							onChange={(e) => {this.handleSelectChange(e,sensorId);}}
						>
							<option value='esp'>Valor específico</option>
							<option value='min'>Valor mínimo</option>
							<option value='max'>Valor máximo</option>
						</Input>
						{valueInput}
						<Col s={12}>
							{errorValor}
						</Col>
						{showFilterValues}
					</Row>
				);
			}
			else{
				return null;
			}
		});

		let buttonDisabled = false;
		let erroresFechas = null;
		let fechasClass = '';

		if (_.includes(knownSensors, null)){
			buttonDisabled = true;
		}

		if (errores['faltaFecha']){
			erroresFechas = (<p className='red-text'> Falta especificar una fecha.</p>);
			buttonDisabled = true;
			fechasClass = 'error';
		}
		else if (errores['fechasMal']){
			erroresFechas = (<p className='red-text'> La fecha de inicio no puede ser posterior a la fecha final. </p>);
			buttonDisabled = true;
			fechasClass = 'error';
		}
		else if (askedSensors.length === 0 || askedSensors.length === selectedSensors.length){
			buttonDisabled = true;
		}

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
					<Row s={12}>
					 	<p className='blue-text text-darken-3'>
							Filtrar resultados por fechas:
						</p>
					 </Row>
					 <Row className="center">
					 	<Input s={12} l={6} type='date' label="Desde..."
							options={{format: 'yyyy-mm-dd'}}
					 		onChange={(e, value) => {this.handleFechaInicio(e, value);}}
							className={fechasClass}/>
					 	<Input s={12} l={6} type='date' label="Hasta..."
							options={{format: 'yyyy-mm-dd'}}
					 		onChange={(e, value) => {this.handleFechaFin(e, value);}}
							className={fechasClass}/>
						{erroresFechas}
					</Row>
					<Row className='center-align'>
						<Button className='blue darken-3' type='submit'
							name='action' disabled={buttonDisabled}
							onClick={() => {this.handleSubmit();}}>
							Consultar <Icon right>bar_chart</Icon>
		   				</Button>
					</Row>
				</div>
			</Card>
		)
	}
}
