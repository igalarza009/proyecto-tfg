import React from 'react';
import '../../index.css';
import * as Parser from './ParseToRDF.js';
import {Row, Col, Card, Icon, Button} from 'react-materialize'
import Papa from 'papaparse';
import M from 'materialize-css';
import axios from 'axios';
import {PruebaInsert} from '../Pruebas/PruebasInsert.js'
import {HTTPPrueba} from '../Pruebas/HTTPPrueba.js'

const _ = require('lodash');

const virtuosoURL = 'http://localhost:8890/sparql';
const RESTfulURLInsert = 'http://localhost:8080/VirtuosoPruebaWeb2/rest/service/insertfile';

const maxReqLength = 250000;

// const coloresLeyenda = {
// 		TemperatureSensor: 'red-text text-darken-2',
// 		ResistanceSensor: 'orange-text text-darken-1',
// 		VentilationSensor: 'yellow-text text-accent-4',
// 		EngineRPMSensor: 'green-text',
// 		EngineConsumptionSensor: 'blue-text',
// 		PressureSensor: 'purple-text',
// 		MeltingTemperatureSensor: 'pink-text text-lighten-2'
// };

// const querystring = require('querystring');

export class ParseData extends React.Component {
	constructor(props) {
	    super(props);
	    // this.handleSubmit = this.handleSubmit.bind(this);
	    this.state = {
			selectFile: true,
	    	parsingFile: false,
			parsingEnded: false,
			file: null,
			fileName: null,
			fileUploaded: false,
			uploadingFile: false,
			error: "",
			showLeyenda: true,
			showInformation: false,
	    }
 	}

	showLeyenda(){
		const showLeyenda = this.state.showLeyenda;
		this.setState({
			showLeyenda: !showLeyenda,
		})
	}

	handleParseFile(){
		// let error = this.state.error;
		if (this.fileInput.files.length > 0){
			const selectedFile = this.fileInput.files;
			const fileName = selectedFile[0].name;
			// let parsedData = [];
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
					error: '',
					parsingFile: true,
					// showLeyenda:false,
					selectFile: false,
					fileName: fileName,
				});

				Papa.parse(selectedFile[0], {
					step: function(row, i) {
						// parsedData.push(row.data[0]);
						if (row.data[0][0] !== "" && !isNaN(row.data[0][1])){
							parsedTimestamps.push(row.data[0][0]);
							parsedValues.push(parseFloat(row.data[0][1]));
						}
					},
					complete: (results) => {
						parsedTimestamps.reverse();
						parsedValues.reverse();
						this.parsingCompleted(fileName, parsedValues, parsedTimestamps, [], []);
					},
				});
			}
		}
		else{
			// errors['noFile'] = true;
			this.setState({
				error: 'noFile',
			});
		}

	}

	parsingCompleted(fileName, parsedValues, parsedTimestamps, fixedValues, fixedTimestamps){
		console.log("CSV file parsed to JSON");
		const firstValues = parsedValues.splice(0, maxReqLength);
		const firstTimestamps = parsedTimestamps.splice(0, maxReqLength);
		// console.log(firstValues);
		// console.log(firstTimestamps);
		// console.log(parsedValues);
		// console.log(parsedTimestamps);
		axios.post("http://35.224.159.30/api/fix/",
			{timestamps: firstTimestamps, values:firstValues}
		)
		.then((response) => {
			console.log(response);
			let newFixedValues = fixedValues.concat(response['data']['values']);
			let newFixedTimestamps = fixedTimestamps.concat(response['data']['timestamps']);
			// console.log(newFixedValues);
			// console.log(newFixedTimestamps);
			if (parsedValues.length > 0){
				this.parsingCompleted(fileName, parsedValues, parsedTimestamps, newFixedValues, newFixedTimestamps);
			}
			else{
				console.log("No hay más datos");
				// console.log(newFixedValues);
				// console.log(newFixedTimestamps);
				let fixedTimestampsISOFormat = [];
				newFixedTimestamps.forEach((value) => {
					let date = new Date(value+'Z');
					fixedTimestampsISOFormat.push(date.toISOString());
					// if (i < 100){
					// 	console.log(value);
					// 	console.log(date);
					// 	console.log(date.toISOString());
					// }
				});
				// console.log(fixedTimestampsISOFormat);
				var file = Parser.parseDataToRDF(fileName, newFixedValues, fixedTimestampsISOFormat, this.props.infoSensores);
				// var file = Parser.parseDataToRDF(fileName, parsedValues, parsedTimestamps, this.props.infoSensores);
				console.log("TTL file created");
				this.setState({
					file: file,
					parsingEnded: true,
					parsingFile: false,
				});
			}
		})
		.catch((error) => {
			console.log(error);
		});
	}

	handleDownload(){
		const file = this.state.file;
		const filename = this.state.fileName;

		let indexOfDot = filename.indexOf('.');
		let sensorIndicator = filename.substring(0, indexOfDot);
		let sensorName = 'sensor' + sensorIndicator;

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

	handleUpload(){
		const file = this.state.file;
		this.setState({
			uploadingFile: true,
			parsingEnded: false,
		})

		var formData = new FormData();
		formData.append("file", file);
		axios.post(RESTfulURLInsert, formData, {
			headers: {
				 'Content-Type': 'multipart/form-data'
			}
		})
		.then((response) => {
			console.log(response);
			this.setState({
				uploadingFile: false,
				fileUploaded: true,
				// parsingEnded: false,
			})
		})
		.catch((error) => {
			console.log(error);
		});
		// alert("Se subiría el archivo a Virtuoso.");
	}

	hanldeNewFile(){
		this.setState({
			selectFile: true,
	    	parsingFile: false,
			parsingEnded: false,
			file: null,
			fileName: null,
			fileUploaded: false,
			uploadingFile: false,
			error: "",
		});
	}

	render(){
		const parsingFile = this.state.parsingFile;
		const noSensor = this.state.noSensor;
		const uploadingFile = this.state.uploadingFile;
		const fileUploaded = this.state.fileUploaded;
		const selectFile = this.state.selectFile;
		const parsingEnded = this.state.parsingEnded;
		const fileName = this.state.fileName;
		const error = this.state.error;
		const infoSensores = this.props.infoSensores;
		const showLeyenda = this.state.showLeyenda;

		const listaSensores = infoSensores.map((sensor, i) => {
			const sensorId = sensor['indicatorId'];
			const sensorName = sensor['name'];
			const sensorType = sensor['sensorType'];
			return(
				<li className="margin-left-big" key={sensorId}> <span className="bold"> {sensorId} </span>: {sensorName} </li>
			);
		});

		console.log(showLeyenda);
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
				  {/* <i className="tiny grey-text text-darken-3 material-icons pointer"
					  onClick={() => {this.showLeyenda();}}>
					  info
				  </i> */}
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
				  <a href='#' className="margin-left-data blue-text text-darken-3 valign-wrapper" onClick={() => this.handleParseFile()}>
					  <Icon className='blue-text text-darken-3'>play_circle_filled</Icon>
					  Empezar anotación de datos.
				  </a>
			  </Row>
            </div>
          </div>);

		// const uploadDataButton = (fileUploaded)
		// 	? (<Button className="blue darken-3 valign-wrapper" disabled>
		// 			Datos insertados
		// 			<Icon left>done</Icon>
		// 		</Button>)
		// 	: (<Button className="blue darken-3 valign-wrapper" onClick={() => this.handleUpload()}>
		// 			Insertar datos
		// 			<Icon left>publish</Icon>
		// 		</Button>);

		const loadingParseFile = (parsingFile)
			? (<Card className="center" title="Anotando datos...">
					<p> Anotación de datos del fichero {fileName} en curso. </p>
					<p> Este proceso puede tardar varios minutos. </p>
					<img className='loading' alt='Cargando' src={require('../../img/loading_bars.gif')}/>
				</Card>)
			: (null);

		const fileParsedOptions = (parsingEnded) &&
			(<Card title='Datos correctamente anotados.'>
				<Row>
					<p className="margin-left">El fichero {fileName} ha sido correctamente anotado en formato RDF.</p>
					<p className="margin-left">Los datos están ahora listos para ser insertados.</p>
				</Row>
				<Row className="center">
					<Button className="blue darken-3 valign-wrapper" onClick={() => this.handleUpload()}>
						Insertar datos
						<Icon left>publish</Icon>
					</Button>
				</Row>
				<Row>
					<Col l={6} s={12}>
						<a href="#" className="blue-text text-darken-3" onClick={() => {this.hanldeNewFile();}}>
							<Icon left>insert_drive_file</Icon>
							Insertar datos de otro fichero.
						</a>
					</Col>
					<Col l={6} s={12}>
						<a href="#" className="blue-text text-darken-3" onClick={() => this.handleDownload()}>
							Descargar fichero en formato RDF.
							<Icon left>file_download</Icon>
						</a>
					</Col>
				</Row>
			</Card>);

		const loadingInsertData = (uploadingFile) &&
			(<Card title="Insertando datos." className="center">
					<p> Insertando los datos del fichero {fileName} en el respositorio de datos. </p>
					<p> La operación puede tardar varios minutos. </p>
					<img className='loading' alt='Cargando' src={require('../../img/loading_bars.gif')}/>
				</Card>);

		const dataInserted = (fileUploaded) &&
			(<Card title='Datos correctamente insertados.'>
				<Row>
					<p className="margin-left">Los datos contenidos en el fichero {fileName} han sido correctamente insertados en el repositorio de datos.</p>
				</Row>
				<Row>
					<Col l={6} s={12}>
						<a href="#" className="blue-text text-darken-3" onClick={() => {this.hanldeNewFile();}}>
							<Icon left>insert_drive_file</Icon>
							Insertar datos de otro fichero.
						</a>
					</Col>
					<Col l={6} s={12}>
						<a href="#" className="blue-text text-darken-3" onClick={() => this.handleDownload()}>
							Descargar fichero en formato RDF.
							<Icon left>file_download</Icon>
						</a>
					</Col>
				</Row>
			</Card>);

		const offsetMainCard = (showLeyenda)
			? "m1"
			: "m1 l2";

		return(
			<div>
				<Row>
					<Col s={12} m={10} l={8} offset={offsetMainCard}>
						<Row>
							{selectFileOption}
							{loadingParseFile}
							{fileParsedOptions}
							{loadingInsertData}
							{dataInserted}
						</Row>
						{/* <Row>
							<Card>Hola</Card>
						</Row> */}
					</Col>
					<Col s={12} m={10} l={4} offset="m1">
						{leyendaSensores}
					</Col>
				</Row>
				{/* <Row>
					<HTTPPrueba />
				</Row> */}
			</div>
		)
	}
}

class ParsingFile extends React.Component {
	render(){
		return(
			<img alt='Cargando' src={require('../../img/loading_bars.gif')}/>
		)
	}
}
