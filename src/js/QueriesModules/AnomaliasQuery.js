import React from 'react';
import '../../index.css';
import {Button, Icon, Row, Col, Card, Input} from 'react-materialize'
import M from 'materialize-css';
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

var _ = require('lodash');
const infoSensores = require('../../infoSensores.json');

export class AnomaliasQueryForm extends React.Component{
	constructor(props){
		super(props);
		this.state = {
            sensorDir: {},
		};
	}

    static getDerivedStateFromProps(props, state){
        let sensorDir = state.sensorDir;
        props.selectedSensors.forEach((sensorId) => {
            if (!sensorDir[sensorId]){
                sensorDir[sensorId] = 'up';
            }
        })
        return {
            sensorDir: sensorDir,
        };
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
	}

	handleSubmit(){
		const sensorDir = this.state.sensorDir;
		this.props.getAnomaliasQuery(sensorDir);
	}

	render(){
        const sensorDir = this.state.sensorDir;
        const selectedSensors = this.props.selectedSensors;

        const sensores = selectedSensors.map((sensorId, i) => {
            const sensor = _.find(infoSensores, ['indicatorId', sensorId]);
			const sensorName = sensor.name;
            const arrowIcon = (sensorDir[sensorId] === 'up')
                ? (<Icon className='blue-text text-darken-3'> arrow_upward </Icon>)
                : (<Icon className='blue-text text-darken-3'> arrow_downward </Icon>);
            return(
                <Row key={this.props.selectedSensors[i]} className="valign-wrapper">
                    <Col>
                        <p> Sensor {sensorId} ({sensorName}): </p>
                    </Col>
                    <Col>
                        <Button floating className='white'
							onClick={() => this.handleClick(sensorId)}>
                            {arrowIcon}
                        </Button>
                    </Col>
                </Row>
            );
        });

		return(
			<Card>
				<div className='form'>
					<Row>
						<p className='grey-text'>
                            Especificar la relación esperada entre los sensores,
                            especificando el aumento o decrecimiento que se debería dar en sus valores.
						</p>
					</Row>
                    {sensores}
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
