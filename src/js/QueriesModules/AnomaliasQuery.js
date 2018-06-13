import React from 'react';
import '../../index.css';
import {Button, Icon, Row, Col, Card, Input} from 'react-materialize'
import M from 'materialize-css';
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

var _ = require('lodash');
const infoSensores = require('../../infoSensores.json');
const paresValores = require('../../paresValores.json');

const parMotorId = '79PWN7';

export class AnomaliasQueryForm extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			selectedSensors: this.props.selectedSensors,
            sensorDir: {},
			calParMotor: false,
			relType: 'custom',
		};
	}

    static getDerivedStateFromProps(props, state){
		if (!_.isEqual(props.selectedSensors, state.selectedSensors)){
			const relType = state.relType;
			if (relType === 'custom'){
				const sensorDir = state.sensorDir;
				let newSensorDir = {};
		        props.selectedSensors.forEach((sensorId) => {
		            if (!sensorDir[sensorId]){
						const sensor = _.find(infoSensores, ['indicatorId', sensorId]);
						if (sensor['resultType'] === 'DoubleValueResult')
							newSensorDir[sensorId] = 'up';
						else
							newSensorDir[sensorId] = 'off';
		            }
					else{
						newSensorDir[sensorId] = sensorDir[sensorId];
					}
		        })
		        return {
		            sensorDir: newSensorDir,
					selectedSensors: props.selectedSensors
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
			const sensor = _.find(infoSensores, ['indicatorId', sensorId]);
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

	handleSubmit(){
		const sensorDir = this.state.sensorDir;
		const calParMotor = this.state.calParMotor;

		console.log(sensorDir);
		console.log(calParMotor);

		this.props.getAnomaliasQuery(sensorDir, {'parMotorId': parMotorId, 'calParMotor': calParMotor});
	}

	render(){
        const sensorDir = this.state.sensorDir;
        const selectedSensors = this.props.selectedSensors;
		const parMotorId = this.state.parMotorId;
		const relType = this.state.relType;

        const sensores = selectedSensors.map((sensorId, i) => {
            const sensor = _.find(infoSensores, ['indicatorId', sensorId]);
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
				const key = "keyRel" + iRel + "par" + iPar;
				return(
					(<p key={key}>Sensor {sensorId} {icon}</p>)
				);
			});
			const id = "sensorRel" + iRel;
			return(
				<Col s={12} l={6} key={id} className="margin-bottom">
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
							Especificar la relación esperada entre los sensores,
							especificando el aumento o decrecimiento que se debería dar en sus valores.
						</p>
					</Row>
					{sensores}
				</div>)
			: (<div>
					<Row>
						<Col s={12}>
							<p className='grey-text'>
								Elegir una de las relaciones entre sensores predefinidas.
							</p>
						</Col>
					</Row>
					<Row>
						{predefRel}
					</Row>
				</div>);

		return(
			<Card>
				<div className='form'>
					<Row>
						<Input s={12} l={6} type='select' defaultValue='custom' onChange={(e) => {this.handleSelectChange(e);}}>
							<option value='custom'>Relación personalizada</option>
							<option value='predef'>Relaciones predefinidas</option>
						</Input>
					</Row>
					{selectedRelType}
					<Row className='center-align'>
						<Button className='blue darken-3' type='submit' name='action'
							onClick={() => {this.handleSubmit();}}>
							Consultar <Icon right>bar_chart</Icon>
		   				</Button>
					</Row>
				</div>
			</Card>
		)
	}
}
