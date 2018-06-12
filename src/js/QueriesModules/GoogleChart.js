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
		 convertFunc: getConvertOptionsFunc(self.props.chartType)
	   };
	   this.chartEvents = [
		 {
		   eventName: 'ready',
		   callback(Chart) {
			 const convertFunc = getConvertOptionsFunc(self.props.chartType) || (t => t);
			 self.setState({convertFunc});
		   },
		 },
		 {
		  eventName: 'select',
		  callback(Chart) {
			  // Returns Chart so you can access props and  the ChartWrapper object from chart.wrapper
			console.log('Selected ', Chart.chart.getSelection());
		  },
	  	},
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
				// options['hAxis'] = {
				// 	'gridlines': {
			   //        // 'count': -1,
			   //         'units': {
			   //            'days': {'format': ['MMM dd']},
			   //            'hours': {'format': ['HH:mm', 'ha']}
				// 	  }
				//   }
		       // };
				options['series'] = series;
				options['axes'] = axes;
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
					'gridlines': {
			          // 'count': -1,
			           'units': {
			              'days': {'format': ['MMM dd']},
			              'hours': {'format': ['HH:mm', 'ha']}
					  }
				  }
			   	};
			   	options['series'] = seriesNotMat;
			   	options['vAxes'] = vAxes;
				options['explorer'] = {'axis': 'horizontal','keepInBounds': true};
			}

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
						chartEvents={this.state.chartEvents}
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
  return window.google && window.google.charts && window.google.charts[chartType]
    ? window.google.charts[chartType].convertOptions
    : null;
}
