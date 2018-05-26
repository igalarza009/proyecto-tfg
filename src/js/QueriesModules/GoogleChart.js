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
	      options: {
	        title: 'Una gráfica',
	      },
	      data: [
	        ['Age', 'Weight'],
	        [8, 12],
	        [4, 5.5],
	        [11, 14],
	        [4, 5],
	        [3, 3.5],
	        [6.5, 7],
	      ],
	    };
  	}

	render(){

		const allData = this.props.allChartData;

		console.log(allData[0]);

		const data = (allData.length > 1)
			? (allData[0][1])
			: (allData[0]);

		return(
			// <div className={'chartContainer'}>
			<Card>
		       <Chart
			        chartType="ColumnChart"
			        data={data}
			        options={this.state.options}
			        graph_id="ScatterChart"
			        width="100%"
			        height="400px"
			        legend_toggle
			    />
		    </Card>
	      	// </div>
		)
	}
}
