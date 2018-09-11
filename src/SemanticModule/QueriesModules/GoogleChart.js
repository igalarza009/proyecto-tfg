// GoogleChart.js
// --------------------------------------------------------------
// Visualización de los resultados de las consultas mediante
// gráficas de Google.
// --------------------------------------------------------------

import React from 'react';
import ReactDOM from 'react-dom';
import '../../index.css';
import {Card} from 'react-materialize'
import M from 'materialize-css';
import {Chart} from 'react-google-charts';

const material = true;

export class GoogleChart extends React.Component{

	constructor(props) {
		super(props);
	  	const self = this;
	   	this.state = {
			convertFunc: getConvertOptionsFunc(this.props.chartType),
	   	};
	   	this.chartEvents = [
			{
		   		eventName: 'ready',
		   		callback(Chart) {
			 		const convertFunc = getConvertOptionsFunc(self.props.chartType) || (t => t);
			 		self.setState({convertFunc});
		   		},
		 	},
	   	]
	 }

	render(){
		let charts = null;
		const allChartData = this.props.allChartData;
		if (allChartData){
			charts = allChartData.map((chartData, i) => {
				var data = chartData['data'];

				var series = {};
				var axes = {'y':{}};
				chartData['y-axis'].forEach((axisValues, i) => {
					series[i] = {'axis': axisValues[0]};
					if (!axes['y'][axisValues[0]]){
						axes['y'][axisValues[0]] = {'label': axisValues[1]};
					}
				});
				var options = {};

				options['chart'] = {};
				options['chart']['title'] = chartData['title'];
				if (chartData['subtitle']){
					options['chart']['subtitle'] = chartData['subtitle'];
				}
				if (this.props.longDateFormat){
					options['hAxis'] = {
						format: 'MMM dd (HH:mm:ss)'
					};
				}
				else{
					options['hAxis'] = {
						format: 'MMM dd'
					};
				}
				options['vAxis'] = {
					format: 'decimal'
				};
				options['series'] = series;
				options['axes'] = axes;

				console.log(options);

				var convertFunc = this.state.convertFunc;
	    		var finalOptions = convertFunc ? convertFunc(options) : options;

				return(
					<Card key={i}>
					   <Chart
							chartType={this.props.chartType}
							data={data}
							options={finalOptions}
							width="100%"
							height="400px"
							chartEvents={convertFunc ? [] : this.chartEvents}
						/>
					</Card>
				);
			});
		}

		return(
			<div className={'chartContainer'}>
				{charts}
			</div>
		)
	}
}

function getConvertOptionsFunc(chartType) {
	return window.google && window.google.charts && window.google.charts[chartType]
	    ? window.google.charts[chartType].convertOptions
	    : null;
}
