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
		 // {
		 //  eventName: 'select',
		 //  callback(Chart) {
			//   // Returns Chart so you can access props and  the ChartWrapper object from chart.wrapper
			// console.log('Selected ', Chart.chart.getSelection());
		 //  },
	  	// },
	   ]
	 }

	render(){

		// const allData = this.props.allChartData;
		//
		// console.log(allData[0]);
		//
		// const data = (allData.length > 1)
		// 	? (allData[0][1])
		// 	: (allData[0]);

		const charts = this.props.allChartData.map((chartData, i) => {
			var title = chartData['title'];
			var subtitle = chartData['subtitle'];
			var data = chartData['data'];
			var series = {};
			var seriesNotMat = {};
			var axes = {'y':{}};
			var vAxes = {};

		// series: {
          //   0: { axis: 'distance' }, // Bind series 0 to an axis named 'distance'.
          //   1: { axis: 'brightness' } // Bind series 1 to an axis named 'brightness'.
          // },
          // axes: {
          //   x: {
          //     distance: {label: 'parsecs'}, // Bottom x-axis.
          //     brightness: {side: 'top', label: 'apparent magnitude'} // Top x-axis.
          //   }
          // }

			chartData['y-axis'].forEach((axisValues, i) => {
				series[i] = {'axis': axisValues[0]};
				seriesNotMat[i] = {'targetAxisIndex': i};
				vAxes[i] = {'title': axisValues[1]};
				if (!axes['y'][axisValues[0]]){
					axes['y'][axisValues[0]] = {'label': axisValues[1]};
				}
			});

			var options = {};

			//For material
			if (material) {
				options['chart'] = {};
				options['chart']['title'] = title;
				options['chart']['subtitle'] = subtitle;
				options['hAxis'] = {
					format: 'MMM dd'
				};
				options['series'] = series;
				options['axes'] = axes;
				// options['axes']['x'] = {
				// 	// format: 'M/d/yyy'
			}
			else{
				// For classic
				// {
			//  displayZoomButtons: false,
			//  series: {
			// 		  0: {targetAxisIndex: 0},
			// 		   1: {targetAxisIndex: 1}
			// 		 },
			// vAxes: {
			// 		// Adds titles to each axis.
			// 		   0: {title: 'Error ( % )'},
			// 		   1: {title: 'Reduction ratio ( % )'}
			// 		 },
		   // }}/>

				options['title'] = title;
				options['hAxis'] = {
					format: 'M/d/yy'
				};
			   	options['series'] = seriesNotMat;
			   	options['vAxes'] = vAxes;
				options['explorer'] = {'axis': 'horizontal','keepInBounds': true};
			}

			const convertFunc = this.state.convertFunc;
			console.log(convertFunc);
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
