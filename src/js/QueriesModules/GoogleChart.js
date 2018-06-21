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
		 convertFunc: getConvertOptionsFunc(this.props.chartType)
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

		const charts = this.props.allChartData.map((chartData, i) => {
			var title = chartData['title'];
			var subtitle = chartData['subtitle'];
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
			options['chart']['title'] = title;
			options['chart']['subtitle'] = subtitle;
			options['hAxis'] = {
				format: 'MMM dd (HH:mm:ss)'
			};
			options['vAxis'] = {
				format: 'decimal'
			}
			options['series'] = series;
			options['axes'] = axes;

			const convertFunc = this.state.convertFunc;
    		const finalOptions = convertFunc ? convertFunc(options) : options;

			return(
				<Card key={i}>
				   <Chart
						chartType={this.props.chartType}
						data={data}
						options={finalOptions}
						graph_id={i}
						width="100%"
						height="400px"
						chartEvents={convertFunc ? null : this.chartEvents}
					/>
				</Card>
			);
		});

		return(
			<div className={'chartContainer'}>
				{charts}
			</div>
		)
	}
}

function getConvertOptionsFunc(chartType) {
	console.log(window.google);
	return window.google && window.google.charts && window.google.charts[chartType]
	    ? window.google.charts[chartType].convertOptions
	    : null;
}
