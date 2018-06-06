import React from 'react';
import ReactDOM from 'react-dom';
import '../../index.css';
import {Card} from 'react-materialize'
import M from 'materialize-css';
import {Chart} from 'react-google-charts';

export class GoogleChart extends React.Component{
	constructor(props) {
	    super(props);
	    this.state = {
	    //   options: {
	    //     title: 'Una gráfica',
		// 	explorer: {
		// 	 	axis: 'horizontal',
		// 	 	keepInBounds: true
		//  	},
		// 	series: {
	    //       // Gives each series an axis name that matches the Y-axis below.
	    //       0: {axis: 'Temps'},
	    //       1: {axis: 'Temps'},
		// 	  2: {axis: 'Daylight'}
	    //     },
	    //     axes: {
	    //       // Adds labels to each axis; they don't have to match the axis names.
	    //       y: {
	    //         Temps: {label: 'Temps (Celsius)'},
	    //         Daylight: {label: 'Daylight'},
	    //       }
		//   },
		// 	hAxis: {
		// 		gridlines: {
		//            count: -1,
		//            units: {
		//               days: {format: ['MMM dd']},
		//               hours: {format: ['HH:mm', 'ha']},
	    //         }
	    //       },
		// 	}
	    //   },
	    //   data: [
	    //     ['Age', 'Weight'],
	    //     [8, 12],
	    //     [4, 5.5],
	    //     [11, 14],
	    //     [4, 5],
	    //     [3, 3.5],
	    //     [6.5, 7],
	    //   ],
	    };
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
			var data = chartData['data'];
			var series = {};
			var axes = {'y':{}};

			chartData['y-axis'].forEach((axisValues, i) => {
				series[i] = {'axis': axisValues[0]};
				if (!axes['y'][axisValues[0]]){
					axes['y'][axisValues[0]] = {'label': axisValues[1]};
				}
			});
			// chart: {
	        //     title: 'Company Performance',
	        //     subtitle: 'Sales, Expenses, and Profit: 2014-2017',
	        //   },

			var options = {};
			options['chart'] = {};
			opootions['chart']['title'] = title;
			options['explorer'] = {'axis': 'horizontal','keepInBounds': true};
			options['series'] = series;
			options['axes'] = axes;

			return(
				<Card key={i}>
				   <Chart
						chartType={this.props.chartType}
						data={data}
						options={options}
						graph_id={i}
						width="100%"
						height="400px"
						legend_toggle
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
