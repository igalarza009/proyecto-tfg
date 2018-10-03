// DataPage.js
// --------------------------------------------------------------
// Página principal de inserción de datos en la máquina seleccionada.
// --------------------------------------------------------------

import React from 'react';
import '../../index.css';
import * as Parser from '../Functions/ParseToRDF.js';
import {Row, Col, Card, Icon, Button} from 'react-materialize'
import Papa from 'papaparse';
import M from 'materialize-css';
import axios from 'axios';
import {PruebaInsert} from '../Pruebas/PruebasInsert.js'
import * as Queries from '../Functions/SPARQLQueries.js';

// const graphURI_Demo = "<http://www.demo.es/bdi/ontologies/extrusion/demo/sensors#>";

// ----------- CAMBIAR EN LA UNIÓN CON I4TSPS ---------
const imgPath = './img/';
// ----------------------------------------------------

const querystring = require('querystring');
const _ = require('lodash');

const maxReqLength = 250000;

const maxReqSize = 260;
const simultReq = 6;

export class ParseData extends React.Component {
	constructor(props) {
	    super(props);
	    this.state = {
			selectFile: true,
	    	insertingData: false,
			dataInserted: false,
			insertState: "",
			fileContent: null,
			fileName: null,
			error: "",
			showLeyenda: false,
	    }
 	}

	showLeyenda(){
		const showLeyenda = this.state.showLeyenda;
		this.setState({
			showLeyenda: !showLeyenda,
		})
	}

	handleInsertData(){
		if (this.fileInput.files.length > 0){
			const selectedFile = this.fileInput.files;
			const fileName = selectedFile[0].name;
			let parsedValues = [];
			let parsedTimestamps = [];

			const indexOfDot = fileName.indexOf('.');
			const sensorIndicator = fileName.substring(0, indexOfDot);
			const currentSensor = _.find(this.props.infoSensores, {indicatorId:sensorIndicator});

			if (currentSensor === undefined){
				this.setState({
					error: 'wrongFile',
				});
			}
			else{
				this.setState({
					error: "",
					insertingData: true,
					insertState: 'readingFile',
					selectFile: false,
					fileName: fileName,
				});

				Papa.parse(selectedFile[0], {
					step: function(row, i) {
						if (row.data[0][0] !== "" && !isNaN(row.data[0][1])){
							parsedTimestamps.push(row.data[0][0]);
							parsedValues.push(parseFloat(row.data[0][1]));
						}
					},
					complete: (results) => {
						console.log("CSV file parsed to JSON");
						parsedTimestamps.reverse();
						parsedValues.reverse();
						this.setState({
							insertState: 'fixingData',
						})
						this.parsingCompleted(fileName, parsedValues, parsedTimestamps, [], []);
					},
				});
			}
		}
		else{
			this.setState({
				error: 'noFile',
			});
		}
	}

	parsingCompleted(fileName, parsedValues, parsedTimestamps, fixedValues, fixedTimestamps){

		const firstValues = parsedValues.splice(0, maxReqLength);
		const firstTimestamps = parsedTimestamps.splice(0, maxReqLength);
		axios.post("http://35.224.159.30/api/fix/",
			{timestamps: firstTimestamps, values:firstValues}
		)
		.then((response) => {
			let newFixedValues = fixedValues.concat(response['data']['values']);
			let newFixedTimestamps = fixedTimestamps.concat(response['data']['timestamps']);
			if (parsedValues.length > 0){
				this.parsingCompleted(fileName, parsedValues, parsedTimestamps, newFixedValues, newFixedTimestamps);
			}
			else{
				console.log("Data fixed.");
				let fixedTimestampsISOFormat = [];
				newFixedTimestamps.forEach((value) => {
					let date = new Date(value+'Z');
					fixedTimestampsISOFormat.push(date.toISOString());
				});
				console.log("Data converted to ISO");
				this.fixingCompleted(fileName, newFixedValues, fixedTimestampsISOFormat)
			}
		})
		.catch((error) => {
			this.setState({
				error: 'errorFixing',
			});
			// alert("Ha ocurrido un error. Mirar en la consola para más información.");
			console.log(error);
		});
	}

	fixingCompleted(fileName, parsedValues, parsedTimestamps){
		this.setState({
			insertState: 'insertingData',
		})

		let infoForParsing = Parser.getInfoToParseData(fileName, this.props.infoSensores, this.props.graphURI);

		// let dataToInsert = '';
		// let cont = 0;
		let i = 0;
		let wholeData = '';

		let tiempo = new Date();
		console.log("Tiempo inicio " + tiempo);
		// this.insertDataRecursive(i, cont, parsedValues, parsedTimestamps, infoForParsing['virtPrefixes'], infoForParsing['sensorName'], infoForParsing['observationType'], infoForParsing['valueType'], dataToInsert, wholeData);
		this.insertDataRecursiveList(i, parsedValues, parsedTimestamps, infoForParsing['virtPrefixes'], infoForParsing['sensorName'], infoForParsing['observationType'], infoForParsing['valueType'], wholeData);
	}

	// insertDataRecursive(index, cont, values, timestamps, prefixes, sensorName, observationType, valueType, dataToInsert, wholeData){
	// 	dataToInsert += Parser.parseDataRecursive(index, values, timestamps, prefixes, sensorName, observationType, valueType);
	//
	// 	index++;
	// 	cont++;
	//
	// 	if(index < values.length){
	// 		if (cont === 21){
	// 			// -------------------- CAMBIAR PARA LA UNIÓN DE I4TSPS --------------------
	// 			// Comentar esto:
	// 			var query = Queries.getInsertQueryLocal(prefixes, dataToInsert, this.props.graphURI);
	// 			// console.log(query);
	// 			// Descomentar esto:
	// 			// var query = Queries.getInsertQueryDebian(prefixes, dataToInsert, this.props.graphURI);
	// 			// -------------------------------------------------------------------------
	// 			axios.post(this.props.usedURL,
	// 				querystring.stringify({'query': query})
	// 			)
	// 			.then((response) => {
	// 				wholeData += dataToInsert;
	// 				dataToInsert = '';
	// 				cont = 0;
	// 				this.insertDataRecursive(index, cont, values, timestamps, prefixes, sensorName, observationType, valueType, dataToInsert, wholeData);
	// 			})
	// 			.catch((error) => {
	// 				this.setState({
	// 					error: 'errorInserting',
	// 				});
	// 				console.log(error);
	// 				console.log(index);
	// 				console.log(query);
	// 			});
	// 		}
	// 		else{
	// 			this.insertDataRecursive(index, cont, values, timestamps, prefixes, sensorName, observationType, valueType, dataToInsert, wholeData);
	// 		}
	// 	}
	// 	else{
	// 		if (cont > 0) {
	// 			console.log('Ultima petición');
	//
	// 			// -------------------- CAMBIAR PARA LA UNIÓN DE I4TSPS --------------------
	// 			// Comentar esto:
	// 			var query = Queries.getInsertQueryLocal(prefixes, dataToInsert, this.props.graphURI);
	// 			// Descomentar esto:
	// 			// var query = Queries.getInsertQueryDebian(prefixes, dataToInsert, this.props.graphURI);
	// 			// -------------------------------------------------------------------------
	//
	// 			axios.post(this.props.usedURL,
	// 				querystring.stringify({'query': query})
	// 			)
	// 			.then((response) => {
	// 				console.log(response);
	// 				let tiempo = new Date();
	// 				console.log("Tiempo Final " + tiempo);
	// 				wholeData += dataToInsert;
	// 				this.setState({
	// 					dataInserted: true,
	// 			        insertingData: false,
	// 					insertState: "",
	// 					fileContent: wholeData,
	// 				})
	// 			})
	// 			.catch((error) => {
	// 				console.log(error);
	// 			});
	// 		}
	// 	}
	// }

	insertDataRecursiveList(index, values, timestamps, prefixes, sensorName, observationType, valueType, wholeData){
		// console.log('Índice base: ' + index);
		let i;
		let dataToInsert = '';
		let firstResponse = true;
		for (i = 0; i < simultReq; i++){
			let iActual = index + (maxReqSize * i) ;
			// console.log('Índice actual: ' + iActual);
			let valuesToInsert = values.slice(iActual, iActual + maxReqSize);
			// console.log(valuesToInsert);
			let timestampsToInsert = timestamps.slice(iActual, iActual + maxReqSize);
			// console.log(timestampsToInsert);
			dataToInsert = Parser.parseDataRecursiveList(valuesToInsert, timestampsToInsert, prefixes, sensorName, observationType, valueType);

			var query = Queries.getInsertQueryLocal(prefixes, dataToInsert, this.props.graphURI);
			axios.post(this.props.usedURL,
				querystring.stringify({'query': query})
			)
			.then((response) => {
				wholeData += dataToInsert;
				// console.log('Respuesta del índice base ' + index + ' y del bucle ' + i);
				if (firstResponse){
					firstResponse = false;
					// console.log('Primera respuesta de la recursividad');
					if(index + (maxReqSize * simultReq * 2) < values.length){
						// let iLog = index + (maxReqSize * simultReq * 2);
						// console.log('Podemos seguir la recursividad: ' + iLog + ' < ' + values.length);
						index = index + (maxReqSize * simultReq);
						this.insertDataRecursiveList(index, values, timestamps, prefixes, sensorName, observationType, valueType, wholeData);
					}
					else{
						let iLog = index + (maxReqSize * simultReq * 2);
						// console.log('No podemos seguir la recursividad: ' + iLog + ' >= ' + values.length);
						let finished = false;
						let contReq = 0;
						let contResp = 0;
						while (!finished){
							if (index + maxReqSize < values.length){
								// let iLog2 = index + maxReqSize;
								// console.log(contReq);
								// console.log('Trozo completo, porque ' + iLog2 + ' < ' + values.length);
								// console.log('Indice actual: ' + index);
								let valuesToInsert = values.slice(index, index + maxReqSize);
								// console.log(valuesToInsert);
								let timestampsToInsert = timestamps.slice(index, index + maxReqSize)
								// console.log(timestampsToInsert);
								dataToInsert = Parser.parseDataRecursiveList(valuesToInsert, timestampsToInsert, prefixes, sensorName, observationType, valueType);
								// contReq++;
							}
							else{
								// let iLog3 = index + maxReqSize;
								// console.log('Última petición');
								// console.log('Indice actual: ' + index);
								let valuesToInsert = values.slice(index);
								// console.log(valuesToInsert);
								let timestampsToInsert = timestamps.slice(index);
								// console.log(timestampsToInsert);
								dataToInsert = Parser.parseDataRecursiveList(valuesToInsert, timestampsToInsert, prefixes, sensorName, observationType, valueType);
								// contReq++;
								finished = true;
							}
							index = index + maxReqSize;
							contReq++;
							var query = Queries.getInsertQueryLocal(prefixes, dataToInsert, this.props.graphURI);
							console.log("Últimas peticiones: " + contReq);
							axios.post(this.props.usedURL,
								querystring.stringify({'query': query})
							)
							.then((response) => {
								contResp++;
								console.log("Últimas respuestas: " + contResp);
								wholeData += dataToInsert;
								if (contResp !== 0 && contResp === contReq){
									let tiempo = new Date();
									console.log("Tiempo Final " + tiempo);
									wholeData += dataToInsert;
									this.setState({
										dataInserted: true,
								        insertingData: false,
										insertState: "",
										fileContent: wholeData,
									})
								}
							})
							.catch((error) => {
								this.setState({
									error: 'errorInserting',
								});
								console.log(error);
								console.log(index);
								console.log(query);
							});
						}

					}
				}
			})
			.catch((error) => {
				this.setState({
					error: 'errorInserting',
				});
				console.log(error);
				console.log(index);
				console.log(query);
			});
		}
	}

	handleDownload(){
		const fileContent = this.state.fileContent;
		const filename = this.state.fileName;

		let indexOfDot = filename.indexOf('.');
		let sensorIndicator = filename.substring(0, indexOfDot);
		let sensorName = 'sensor' + sensorIndicator;

		let prefixes = this.getTurtlePrefixes();

		let file = new Blob([prefixes + fileContent], {type: "text/plain"});
		let outputFileName = sensorName + '.ttl'

		if (window.navigator.msSaveOrOpenBlob) // IE10+
	        window.navigator.msSaveOrOpenBlob(file, outputFileName);
	    else { // Others
	        var a = document.createElement("a"),
	                url = URL.createObjectURL(file);
	        a.href = url;
	        a.download = outputFileName;
	        document.body.appendChild(a);
	        a.click();
	        setTimeout(function() {
	            document.body.removeChild(a);
	            window.URL.revokeObjectURL(url);
	        }, 0);
	    }
	}

	getTurtlePrefixes(){
		const turtlePrefixes = "@prefix : " + this.props.graphURI + " . " +
							"@prefix owl: <http://www.w3.org/2002/07/owl#> . " +
							"@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . " +
							"@prefix xsd: <http://www.w3.org/2001/XMLSchema#> . " +
							"@prefix sosa: <http://www.w3.org/ns/sosa/> . " +
							"@base " + this.props.graphURI + " . ";
		return turtlePrefixes;
	}

	hanldeNewFile(){
		this.setState({
			selectFile: true,
	    	insertingData: false,
			insertState: "",
			dataInserted: false,
			file: null,
			fileName: null,
			error: "",
		});
	}

	render(){
		const selectFile = this.state.selectFile;
		const insertingData = this.state.insertingData;
		const dataInserted = this.state.dataInserted;
		const fileName = this.state.fileName;
		const error = this.state.error;
		const infoSensores = this.props.infoSensores;
		const showLeyenda = this.state.showLeyenda;
		const insertState = this.state.insertState;

		const listaSensores = infoSensores.map((sensor, i) => {
			const sensorId = sensor['indicatorId'];
			const sensorName = sensor['name'];
			const sensorType = sensor['sensorType'];
			return(
				<li className="margin-left-big" key={sensorId}> <span className="bold"> {sensorId} </span>: {sensorName} </li>
			);
		});

		const leyendaSensores = (selectFile && showLeyenda) &&
			(<div className="card">
	            <div className="card-content">
	              <span className="card-title blue-text text-darken-3">Sensores disponibles: </span>
					<p> Los sensores disponibles actualmente en el sistema para esta máquina son: </p>
					<div className="margin-top">
						{listaSensores}
					</div>
				</div>
			</div>);

		let errorCard = null;

		if (error === 'noFile'){
			errorCard = (<Row className="red-text">
						<p className="margin-left"> No se ha seleccionado ningún archivo de datos. </p>
					</Row>);
		}
		else if (error === 'wrongFile'){
			errorCard = (<Row className="red-text ">
						<p className="margin-left"> El nombre del fichero no corresponde a ningún indicador de los sensores contemplados para esta máquina. </p>
					</Row>);
		}

		const selectFileOption = (selectFile) &&
		(<div className="card">
            <div className="card-content">
              <span className="card-title blue-text text-darken-3">Seleccionar archivo de datos a insertar</span>
			  <p>El archivo deberá estar en formato CSV y tener por nombre el indicador del sensor del que aporta los datos. </p>
			  <p> Los datos a insertar deberán corresponder con alguno de los sensores disponibles en el sistema para la máquina actual.
				  <i className="tiny grey-text text-darken-3 material-icons pointer"
					  onClick={() => {this.showLeyenda();}}>
					  info
				  </i>
			  </p>
			  <form action="#">
				  <div className="file-field input-field">
					  <div className="btn blue darken-3">
						  <span>Fichero</span>
						  <input type="file"
							  ref={input => {this.fileInput = input;}}
							  accept=".csv"/>
					  </div>
					  <div className="file-path-wrapper">
						  <input className="file-path validate"
							  type="text"
							  placeholder="Ejemplo: 123XYZ.csv"/>
					  </div>
				  </div>
			  </form>
			  {errorCard}
			  <Row>
				  <a href='#' className="margin-left-data blue-text text-darken-3 valign-wrapper"
					  onClick={() => this.handleInsertData()}>
					  <Icon className='blue-text text-darken-3'>play_circle_filled</Icon>
					  <span className="margin-left"> Comenzar con la inserción de datos. </span>
				  </a>
			  </Row>
            </div>
          </div>);

		let loadingMessage = "";
		if (insertingData && insertState === 'readingFile'){
			loadingMessage = (<p> Leyendo los datos del fichero <span className="bold">{fileName}</span> </p>)
		}
		else if (insertingData && insertState === 'fixingData'){
			loadingMessage = (<p> Preprocesando los datos del fichero <span className="bold">{fileName}</span> para corregir ciertos errores antes de ser insertados.</p>)
		}
		else{
			loadingMessage = (<p> Insertando los datos corregidos del fichero <span className="bold">{fileName}</span> en el respositorio de datos. </p>)
		}

		const loadingInsertData = (error !== 'errorParsing' && error !== 'errorInserting' && insertingData) &&
			(<div className="card">
			 	<div className="card-content center">
			    	<span className="card-title blue-text text-darken-3">Insertando datos... </span>
					{loadingMessage}
					<p> La operación puede tardar varios minutos. </p>
					<img className='loading' alt='Cargando' src={`${imgPath}loading_bars.gif`}/>
				</div>
			</div>);

			const dataInsertedCard = (error !== 'errorParsing' && error !== 'errorInserting' && dataInserted) &&
				(<div className="card">
					<div className="card-content center">
						<span className="card-title green-text green-darken-3"><Icon>done</Icon> Datos correctamente insertados.</span>
						<Row>
							<p className="margin-left">Los datos contenidos en el fichero <span className="bold">{fileName}</span> han sido correctamente insertados en el repositorio de datos.</p>
						</Row>
						<Row>
							<Col l={6} s={12}>
								<a href="#" className="blue-text text-darken-3 valign-wrapper" onClick={() => {this.hanldeNewFile();}}>
									<Icon>insert_drive_file</Icon>
									Insertar datos de otro fichero.
								</a>
							</Col>
							<Col l={6} s={12}>
								<a href="#" className="blue-text text-darken-3 valign-wrapper" onClick={() => this.handleDownload()}>
									<Icon>file_download</Icon>
									Descargar fichero en formato RDF.
								</a>
							</Col>
						</Row>
					</div>
				</div>);

		let errorTitle = '';
		let errorDesc = '';
		if (error === 'errorParsing'){
			errorTitle = 'Error preprocesando'
			errorDesc = 'Ha ocurrido un error preprocesando los datos.'
		}
		else if(error === 'errorInserting'){
			errorTitle = 'Error insertando'
			errorDesc = 'Ha ocurrido un error insertando los datos.'
		}

		const errorReqCard = (error === 'errorParsing' || error === 'errorInserting') &&
		(<div className="card">
            <div className="card-content center">
              <span className="card-title red-text text-darken-3">{errorTitle}</span>
			  <p>{errorDesc} </p>
			  <Row className='margin-top'>
				  <Button className="blue darken-3" onClick={() => this.hanldeNewFile()}>
					  Volver a intentar
				  </Button>
			  </Row>
            </div>
		</div>);

		const offsetMainCard = (showLeyenda && selectFile)
			? "m1"
			: "m1 l2";

		return(
			<div>
				<Row>
					<Col s={12} m={10} l={8} offset={offsetMainCard}>
						<Row>
							{selectFileOption}
							{loadingInsertData}
							{dataInsertedCard}
							{errorReqCard}
						</Row>
					</Col>
					<Col s={12} m={10} l={4} offset="m1">
						{leyendaSensores}
					</Col>
				</Row>
			</div>
		)
	}
}

class ParsingFile extends React.Component {
	render(){
		return(
			<img alt='Cargando' src={`${imgPath}loading_bars.gif`}/>
		)
	}
}
