import React from 'react';
import '../../index.css';
import {Button, Icon, Row, Col, Card, Input} from 'react-materialize'
import M from 'materialize-css';
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

var _ = require('lodash');
const infoSensores = require('../../infoSensores.json');

export class InformationQueryForm extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			fechaInicio: '',
			fechaFin: '',
			horaInicio: {hor:null, min:null, seg:null},
			horaFin: {hor:null, min:null, seg:null},
			selectAggregates: {'avg':false, 'min':false, 'max':false},
			groupBy: 'day',
			filterValues: [],
			values: {},
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

	handleTimeChange(event,  timeName, timeType){
		let value = event.target.value;
		let newValue = value;
		if (value.length === 1){
			newValue = '0' + value;
			event.target.value = newValue;
		}
		else if (value.length === 3){
			newValue = value.substr(1);
			event.target.value = newValue;
		}
		let time = this.state[timeName];
		time[timeType] = newValue;
		this.setState({
			[timeName]: time,
		});
	}

	handleSwitch(event, sensorId){
		let checked = event.target.checked;
		let values = this.state.values;
		if (values[sensorId])
			values[sensorId][0] = checked;
		else
			values[sensorId] = [checked];

		this.setState({
			values: values,
		});
		console.log(values);
	}

	handleRange(range, sensorId){
		let values = this.state.values;
		values[sensorId] = range;
		this.setState({
			values: values,
		});
		console.log(values);

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
		let filterValues = {'filter': false, 'values': {}};
		let orderBy = {'orderBy':true, 'order':'desc', 'orderField':'dateTime'};

		const fechaInicio = this.state.fechaInicio;
		const fechaFin = this.state.fechaFin;
		const horaInicio = this.state.horaInicio;
		const horaFin = this.state.horaFin;
		const values = this.state.values;
		const stateFilterValues = this.state.filterValues;
		const selectAggregates = this.state.selectAggregates;
		const groupByState = this.state.groupBy;

		if (fechaInicio !== ''){
			filter['filter'] = true;
			filter['filterDate'] = true;
			filter['startDate'] = fechaInicio;
			filter['endDate'] = fechaFin;
		}

		let filterTime = true;
		_.forEach(horaInicio, (value, key) => {
			if (value === null){
				filterTime = false;
			}
		});

		if (filterTime){
			filter['filter'] = true;
			filter['filterTime'] = true;
			filter['startTime'] = horaInicio['hor'] + ':' + horaInicio['min'] + ':' + horaInicio['seg'];
			filter['endTime'] = horaFin['hor'] + ':' + horaFin['min'] + ':' + horaFin['seg'];
		}

		if (stateFilterValues.length > 0){
			filterValues['filter'] = true;
			stateFilterValues.forEach((sensorId) => {
				filterValues['values'][sensorId] = values[sensorId];
			});
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

		console.log(filter);

		this.props.getInformationQuery(sensors, groupBy, filter, filterValues, orderBy);
	}

	render(){
		const groupBy = this.state.groupBy;
		const selectedSensors = this.props.selectedSensors;
		const filterValues = this.state.filterValues;
		const values = this.state.values;

		const Slider = require('rc-slider');
		const createSliderWithTooltip = Slider.createSliderWithTooltip;
		const Range = createSliderWithTooltip(Slider.Range);

		let groupByDisabled = (groupBy === '')
			? (true)
			: (false);

		const filtrarValores = selectedSensors.map((sensorId) => {
			const sensor = _.find(infoSensores, ['indicatorId', sensorId]);
			const sensorName = sensor['name'];
			const labelCheckbox = "Sensor " + sensorId + " (" + sensorName + ") : ";
			const minValue = sensor["minValue"];
			const maxValue = sensor["maxValue"];
			const disabled = (filterValues.indexOf(sensorId) === -1)
				? (true)
				: (false);

			const defaultRange = (!values[sensorId])
				? ([minValue, maxValue])
				: ([values[sensorId][0], values[sensorId][1]]);

			const valuePicker = (sensor['resultType'] === 'DoubleValueResult')
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
								onChange={(r) => {this.handleSwitch(r,sensorId);}}
							/>
							<span className="lever"></span>
							On
						</label>
					</div>);
			return(
				<Row key={sensorId} s={12}>
					<Col s={12}>
						<Input name='filterValue' type='checkbox' className='filled-in'
							label={labelCheckbox}
							onChange={(e) => {this.handleFilterValueChecked(e,sensorId,minValue,maxValue);}}
						/>
					</Col>
					<Col s={10} offset="s1">
						{valuePicker}
					</Col>
				</Row>
			);
		});

		return(
			<Card>
				<div className='form'>
					<Row>
						<p className='grey-text'>
							Obtener una gráfica sobre los valores que toman los sensores selecionados.
							Completa solo los campos deseados para aplicar filtros a la respuesta.
						</p>
					</Row>
					<Row s={12}>
						<p className='blue-text text-darken-3'>Filtrar resultados por fechas: </p>
					</Row>
					<Row className="center">
						<Col s={12} l={6}>
							<Input type='date' label="Desde..." options={{format: 'yyyy-mm-dd'}}
								onChange={(e, value) => {this.handleFechaInicio(e, value);}} />
						</Col>
						<Col s={12} l={6}>
							<Input type='date' label="Hasta..." options={{format: 'yyyy-mm-dd'}}
								onChange={(e, value) => {this.handleFechaFin(e, value);}} />
						</Col>
					</Row>
					<Row s={12}>
						<p className='blue-text text-darken-3'>Filtrar resultados por horas: </p>
					</Row>
					<Row className='grey-text center'>
						<Col s={12} l={6}>
							Desde las... (HH:mm:ss)
						</Col>
						<Col s={12} l={6}>
							Hasta las... (HH:mm:ss)
						</Col>
					</Row>
					<Row className='center'>
						<Col s={12} l={6}>
							<input id="number" type="number" min="0" max="23"
								onChange={(e) => {this.handleTimeChange(e, 'horaInicio', 'hor');}}/>
							:
							<input id="number" type="number" min="0" max="59"
								onChange={(e) => {this.handleTimeChange(e, 'horaInicio', 'min');}}/>
							:
							<input id="number" type="number" min="0" max="59"
								onChange={(e) => {this.handleTimeChange(e, 'horaInicio', 'seg');}}/>
							{/* <Input name='hora1' type='text'  label="Desde las... (HH:mm:ss)" onChange={(e, value) => {this.handleHoraInicio(e, value);}}/> */}
						</Col>
						<Col s={12} l={6}>
							{/* <Input name='hora2' type='text'  label="Hasta las... (HH:mm:ss)" onChange={(e, value) => {this.handleHoraFin(e, value);}}/> */}
							<input id="number" type="number" min="0" max="23"
								onChange={(e) => {this.handleTimeChange(e, 'horaFin', 'hor');}}/>
							:
							<input id="number" type="number" min="0" max="59"
								onChange={(e) => {this.handleTimeChange(e, 'horaFin', 'min');}}/>
							:
							<input id="number" type="number" min="0" max="59"
								onChange={(e) => {this.handleTimeChange(e, 'horaFin', 'seg');}}/>
						</Col>
					</Row>
					<Row s={12}>
						<p className='blue-text text-darken-3'>Filtrar resultados por valores: </p>
					</Row>
					{filtrarValores}
					<Row s={12}>
						<p className='blue-text text-darken-3'>Agrupar resultados para mostrar: </p>
					</Row>
					<Row>
						<Col s={12}>
							<Input name='groupBy' type='checkbox' className='filled-in'
								value='avg' label='Valor medio del sensor (AVG)'
								onChange={(e) => {this.handleAggregates(e);}}
							/>
						</Col>
						<Col s={12}>
							<Input name='groupBy' type='checkbox' className='filled-in'
								value='max' label='Valor máximo del sensor (MAX)'
								onChange={(e) => {this.handleAggregates(e);}}
							/>
						</Col>
						<Col s={12}>
							<Input name='groupBy' type='checkbox' className='filled-in'
								value='min' label='Valor mínimo del sensor (MIN)'
								onChange={(e) => {this.handleAggregates(e);}}
							/>
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
