import React from 'react';
import '../../index.css';
import * as Parser from './ParseToRDF.js';
import {Row, Col, Card, Icon} from 'react-materialize'
import Papa from 'papaparse';
import M from 'materialize-css';
import axios from 'axios';
import {HTTPPrueba} from '../Pruebas/HTTPPrueba.js'

export class ParseData extends React.Component {
	constructor(props) {
	    super(props);
	    this.handleSubmit = this.handleSubmit.bind(this);
	    this.state = {
	    	parsingElement: false,
	    }
 	}

	handleSubmit(event){
		const selectedFile = this.fileInput.files;
		const fileName = selectedFile[0].name;
		let parsedData = [];

		Papa.parse(selectedFile[0], {
			// worker: true,
			step: function(row) {
				// console.log("Row:", row.data);
				parsedData.push(row.data[0]);
			},
			complete: function() {
				console.log("All done!");
				Parser.parseDataToRDF(fileName, parsedData);
			}
		});

	}

	handleInsert(){
		const pruebaInsert = ':sensor2F1KT7obs1prueba2 rdf:type owl:NamedIndividual , ' +
								':TemperatureObservation . ' +
								':sensor2F1KT7obs1prueba2Result rdf:type owl:NamedIndividual , ' +
								':DoubleValueResult . ' +
								':sensor2F1KT7obs1prueba2Result sosa:hasSimpleResult "5555"^^xsd:double . ' +
								':sensor2F1KT7obs1prueba2 sosa:hasResult :sensor2F1KT7obs1prueba2Result . ' +
								':sensor2F1KT7obs1prueba2 sosa:resultTime "2018-05-15T23:05:55.555Z" . ' + //Añadir ^^xsd:dateTime
								':sensor2F1KT7 sosa:madeObservation :sensor2F1KT7obs1prueba2 . ';

		const pruebaInsertQuery = 'prefix : <http://www.sensores.com/ontology/prueba02/extrusoras#> ' +
								'prefix owl: <http://www.w3.org/2002/07/owl#> ' +
								'prefix sosa: <http://www.w3.org/ns/sosa/> ' +
								'prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
								'prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> ' +
								'insert data ' +
								'{ ' +
								'graph <http://www.sensores.com/ontology/prueba02/extrusoras#> ' +
									'{ ' + pruebaInsert + '} ' +
								'} ';

		const querystring = require('querystring');

		axios.post('http://localhost:8890/sparql-auth', querystring.stringify({'query': pruebaInsertQuery}),{
			auth: {
    			username: 'prueba1',
    			password: 'prueba1'
  			},
		})
		.then((response) => {
			console.log(response);
		})
		.catch((error) => {
			console.log(error);
		});

	}

	render(){
		const loading = this.state.parsingElement
			? (<ParsingElement />)
			: (null);

		return(
			<div>
			<Row>
				<Col s={12} m={8}>
					<Card>
						<form action="#">
						    <div className="file-field input-field">
						    	<div className="btn blue darken-3">
						    		<span>File</span>
						    		<input type="file" ref={input => {this.fileInput = input;}} />
						    	</div>
						    	<div className="file-path-wrapper">
						    		<input className="file-path validate" type="text" placeholder="Upload the files to parse"/>
						    	</div>
							</div>
						</form>
						<a href='#' className="blue-text darken-3 valign-wrapper" onClick={() => this.handleSubmit()}>
							<Icon className='blue-text darken-3'>file_download</Icon>
							Descargar archivo en RDF
						</a>
						<a href='#' className="blue-text darken-3 valign-wrapper" onClick={() => this.handleInsert()}>
							<Icon className='blue-text darken-3'>arrow_upward</Icon>
							Insertar tuplas de prueba
						</a>
					</Card>
				</Col>
				<Col>
					{loading}
				</Col>
			</Row>
			<Row>
				<HTTPPrueba />
			</Row>
		</div>
		)
	}
}

class ParsingElement extends React.Component {
	render(){
		return(
			<img alt='Estado de descarga' src={require('../../img/loading_bars.gif')}/>
		)
	}
}
