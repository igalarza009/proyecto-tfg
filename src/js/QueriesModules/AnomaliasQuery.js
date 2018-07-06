import React from 'react';
import '../../index.css';
import {Button, Icon, Row, Col, Card, Input} from 'react-materialize'
import M from 'materialize-css';
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

var _ = require('lodash');
// const infoSensores = require('../../infoSensores.json');
const paresValores = require('../../paresValores.json');

const parMotorId = '79PWN7';

export class AnomaliasQueryForm extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			selectedSensors: this.props.selectedSensors,
            sensorDir: {},
			calParMotor: false,
			relType: 'predef',
			fechaInicio: '',
			fechaFin: '',
			errores: {
				fechasMal:false,
				faltaFecha: false,
			},
		};
	}

    static getDerivedStateFromProps(props, state){
		if (!_.isEqual(props.selectedSensors, state.selectedSensors)){
			const relType = state.relType;
			if (relType === 'custom'){
				const sensorDir = state.sensorDir;
				let newSensorDir = {};
				let relType = state.relType;
		        props.selectedSensors.forEach((sensorId) => {
		            if (!sensorDir[sensorId]){
						const sensor = _.find(props.infoSensores, ['indicatorId', sensorId]);
						if (sensor['resultType'] === 'DoubleValueResult')
							newSensorDir[sensorId] = 'up';
						else
							newSensorDir[sensorId] = 'off';
		            }
					else{
						newSensorDir[sensorId] = sensorDir[sensorId];
					}
		        });
				if (props.selectedSensors.length <2)
					relType = 'predef';
		        return {
		            sensorDir: newSensorDir,
					selectedSensors: props.selectedSensors,
					relType: relType
		        };
			}
			else{
				return {
					selectedSensors: props.selectedSensors
				};
			}
		}
		else{
			return null;
		}
    }

	resetValues(){
		let sensorDir = {};
		this.state.selectedSensors.forEach((sensorId) => {
			const sensor = _.find(this.props.infoSensores, ['indicatorId', sensorId]);
			if (sensor['resultType'] === 'DoubleValueResult')
				sensorDir[sensorId] = 'up';
			else
				sensorDir[sensorId] = 'off';
        });
        this.setState({
            sensorDir: sensorDir,
			calParMotor: false,
        });
	}

	handleParMotorChecked(event){
		const checked = event.target.checked;
		this.setState({
			calParMotor: checked,
		});
		console.log(checked);
	}

    handleClick(sensorId){
	      let sensorDir = this.state.sensorDir;
          if (sensorDir[sensorId] === 'up'){
              sensorDir[sensorId] = 'down';
          }
          else{
              sensorDir[sensorId] = 'up';
          }
          this.setState({
             sensorDir: sensorDir,
          });

		  console.log(sensorDir);
	}

	handleSwitch(event, sensorId){
		let sensorDir = this.state.sensorDir;
		if (sensorDir[sensorId] === 'off'){
			sensorDir[sensorId] = 'on';
		}
		else{
			sensorDir[sensorId] = 'off';
		}
		this.setState({
		   sensorDir: sensorDir,
		});

		console.log(sensorDir);
	}

	handleRadioChange(event, i){
		// const value = event.target.value;
		// alert("selected radio " + i);
		const selectedRel = paresValores[i];
		let sensorDir = {};
		let calParMotor = false;
		_.forEach(selectedRel, (value, key) => {
			if (key === 'ParMotor'){
				sensorDir[parMotorId] = value;
				calParMotor = true;
			}
			else{
				sensorDir[key] = value;
			}
		});

		this.setState({
			sensorDir: sensorDir,
			calParMotor: calParMotor,
		});

		console.log(sensorDir);
		console.log(calParMotor);
	}

	handleSelectChange(event){
		const value = event.target.value;
		if (value === 'custom'){
			this.resetValues();
		}
		this.setState({
			relType: value,
		});
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
		const sensorDir = this.state.sensorDir;
		const calParMotor = this.state.calParMotor;
		const fechaInicio = this.state.fechaInicio;
		const fechaFin = this.state.fechaFin;

		let filter = {'filter':false, 'filterDate':false, 'startDate':'', 'endDate':'', 'filterTime':false, 'startTime':'', 'endTime':''};

		if (fechaInicio !== ''){
			filter['filter'] = true;
			filter['filterDate'] = true;
			filter['startDate'] = fechaInicio;
			filter['endDate'] = fechaFin;
		}

		this.props.getAnomaliasQuery(sensorDir, {'parMotorId': parMotorId, 'calParMotor': calParMotor}, filter);
	}

	render(){
        const sensorDir = this.state.sensorDir;
        const selectedSensors = this.props.selectedSensors;
		const parMotorId = this.state.parMotorId;
		const relType = this.state.relType;
		const errores = this.state.errores;

		const select = (selectedSensors.length > 1)
			? (<Input s={12} l={6} type='select' defaultValue='predef' onChange={(e) => {this.handleSelectChange(e);}}>
					<option value='predef'>Relación predefinida</option>
					<option value='custom'>Relación personalizada</option>
				</Input>)
			: (null);

        const sensores = selectedSensors.map((sensorId, i) => {
            const sensor = _.find(this.props.infoSensores, ['indicatorId', sensorId]);
			const sensorName = sensor.name;
            const arrowIcon = (sensorDir[sensorId] === 'up')
                ? (<Icon className='blue-text text-darken-3'> arrow_upward </Icon>)
                : (<Icon className='blue-text text-darken-3'> arrow_downward </Icon>);
			const parMotor = (sensorId === parMotorId)
				? (<Col s={12}>
						<Input name='filterValue' type='checkbox' className='filled-in'
							label="Calcular Par Motor"
							onChange={(e) => {this.handleParMotorChecked(e);}}
						/>
					</Col>)
				: (null);

			const valueType = (sensor['resultType'] === 'DoubleValueResult')
				? (<Button floating className='white'
						onClick={() => this.handleClick(sensorId)}>
						{arrowIcon}
					</Button>)
				: (<div className="switch">
						<label>
							False
							<input type="checkbox"
								onChange={(e) => {this.handleSwitch(e,sensorId);}}
							/>
							<span className="lever"></span>
							True
						</label>
					</div>);
            return(
                <Row key={this.props.selectedSensors[i]} className="valign-wrapper">
                    <Col>
                        <p> Sensor {sensorId} ({sensorName}): </p>
                    </Col>
                    <Col>
                        {valueType}
                    </Col>
					{parMotor}
                </Row>
            );
        });

		const predefRel = paresValores.map((object, iRel) => {
			let sensorIds = [];
			let sensorIdDirs = [];
			_.forEach(object, (value, key) => {
				sensorIds.push(key);
				sensorIdDirs.push(value);
			});
			const sensorRels = sensorIdDirs.map((value, iPar) => {
				const arrowDir = (value === 'up') ? "arrow_upward" : "arrow_downward";
				const icon = (<Icon>{arrowDir}</Icon>);
				const sensorId = sensorIds[iPar];
				let sensorName;
				if (sensorId === 'ParMotor'){
					sensorName = "Cálculo del par motor (Consumo del motor)";
				}
				else{
					const sensor = _.find(this.props.infoSensores, ['indicatorId', sensorId]);
					sensorName = 'Sensor ' + sensorId + ' (' + sensor.name + ')';
				}
				const key = "keyRel" + iRel + "par" + iPar;
				return(
					(<p key={key}> {sensorName} {icon}</p>)
				);
			});
			const id = "sensorRel" + iRel;
			// const checked = (iRel === 0)
			// 	? (true)
			// 	: (false);
			return(
				<Col s={12} key={id} className="margin-bottom">
					<input name="predefRel" className="with-gap" type="radio" id={id} onChange={(e) => {this.handleRadioChange(e,iRel);}}/>
					<label htmlFor={id} className="valign-wrapper">
						{sensorRels}
					</label>
				</Col>
			);
		});

		const selectedRelType = (relType === 'custom')
			? (<div>
					<Row>
						<p className='grey-text'>
							Especificar la tendencia que debería darse en los valores de los sensores seleccionados en condiciones normales.
						</p>
					</Row>
					{sensores}
				</div>)
			: (<div>
					<Row>
						<Col s={12}>
							<p className='grey-text'>
								Elegir una de las relaciones predefinidas, que representan la tendencia que debería darse en los valores de los sensores en condiciones normales.
							</p>
						</Col>
					</Row>
					<Row>
						{predefRel}
					</Row>
				</div>);

		let buttonDisabled = false;
		let erroresFechas = null;
		let fechasClass = '';

		if (_.size(sensorDir) < 1){
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

		return(
			<Card>
				<div className='form'>
					<Row>
						{select}
					</Row>
					<Row s={12}>
					 	<p className='blue-text text-darken-3'>
							Relación que debería darse entre los sensores:
						</p>
					 </Row>
					{selectedRelType}
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
						<Button className='blue darken-3' type='submit' name='action' disabled={buttonDisabled}
							onClick={() => {this.handleSubmit();}}>
							Consultar <Icon right>bar_chart</Icon>
		   				</Button>
					</Row>
				</div>
			</Card>
		)
	}
}
