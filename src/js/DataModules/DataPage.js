import React from 'react';
import '../../index.css';
import * as Parser from './ParseToRDF.js';
import {Row, Col, Card, Icon, Button} from 'react-materialize'
import Papa from 'papaparse';
import M from 'materialize-css';
import axios from 'axios';
import {PruebaInsert} from '../Pruebas/PruebasInsert.js'
import {HTTPPrueba} from '../Pruebas/HTTPPrueba.js'

const virtuosoURL = 'http://localhost:8890/sparql';
const RESTfulURLInsert = 'http://localhost:8080/VirtuosoPruebaWeb2/rest/service/insertfile';

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
	    }
 	}

	// handleSubmit(event){
	// 	const selectedFile = this.fileInput.files;
	// 	const fileName = selectedFile[0].name;
	// 	let parsedData = [];
	//
	// 	Papa.parse(selectedFile[0], {
	// 		// worker: true,
	// 		step: function(row) {
	// 			// console.log("Row:", row.data);
	// 			parsedData.push(row.data[0]);
	// 		},
	// 		complete: function() {
	// 			console.log("CSV file parsed to JSON");
	// 			var file = Parser.parseDataToRDF(fileName, parsedData);
	// 			console.log("TTL file created")
	// 			var formData = new FormData();
	// 			formData.append("file", file);
	// 			axios.post(RESTfulURLInsert, formData, {
	// 				headers: {
	// 					 'Content-Type': 'multipart/form-data'
	// 				}
	// 			})
	// 			.then((response) => {
	// 				console.log(response);
	// 			})
	// 			.catch((error) => {
	// 				console.log(error);
	// 			});
	// 		}
	// 	});
	//
	// }

	handleParseFile(){
		const selectedFile = this.fileInput.files;
		const fileName = selectedFile[0].name;
		let parsedData = [];

		this.setState({
			parsingFile: true,
			selectFile: false,
			fileName: fileName,
		});

		Papa.parse(selectedFile[0], {
			step: function(row) {
				parsedData.push(row.data[0]);
			},
			complete: (results) => {this.parsingCompleted(fileName,parsedData)},
		});
	}

	parsingCompleted(fileName, parsedData){
			console.log("CSV file parsed to JSON");
			var file = Parser.parseDataToRDF(fileName, parsedData);
			console.log("TTL file created");
			this.setState({
				file: file,
				parsingEnded: true,
				parsingFile: false,
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
				parsingEnded: true,
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
		});
	}

	render(){
		const loadingParseFile = (this.state.parsingFile)
			? (<div className="center">
					<p> Traduciendo fichero... </p>
					<img className='loading' alt='Cargando' src={require('../../img/loading_bars.gif')}/>
				</div>)
			: (null);

		const loadingInsertData = (this.state.uploadingFile)
			? (<div className="center">
					<p> Insertando los datos en Virtuoso... </p>
					<p> La operación puede tardar varios minutos. </p>
					<img className='loading' alt='Cargando' src={require('../../img/loading_bars.gif')}/>
				</div>)
			: (null);

		const uploadDataButton = (this.state.fileUploaded)
			? (<Button className="blue darken-3 valign-wrapper" disabled>
					Datos insertados
					<Icon left>done</Icon>
				</Button>)
			: (<Button className="blue darken-3 valign-wrapper" onClick={() => this.handleUpload()}>
					Insertar datos
					<Icon left>publish</Icon>
				</Button>);

		const selectFileOption = (this.state.selectFile)
			? (<div className="upload_file">
					<form action="#">
						<div className="file-field input-field">
							<div className="btn blue darken-3">
								<span>File</span>
								<input type="file"
									ref={input => {this.fileInput = input;}} />
							</div>
							<div className="file-path-wrapper">
								<input className="file-path validate"
									type="text"
									placeholder="Subir archivo para traducir"/>
							</div>
						</div>
					</form>
					<a href='#' className="blue-text text-darken-3 valign-wrapper" onClick={() => this.handleParseFile()}>
							<Icon className='blue-text text-darken-3'>cached</Icon>
							Traducir archivo a formato RDF.
					</a>
				</div>)
			: (null);

		const fileParsedOptions = (this.state.parsingEnded)
			? (<Row>
					<Col s={12} className="center">
						<p>El fichero  {this.state.fileName}  ha sido correctamente traducido a RDF.</p>
						<br/>
					</Col>
					<Col s={6} className="center">
					 	<Button className="blue darken-3 valign-wrapper" onClick={() => this.handleDownload()}>
							Descargar RDF
							<Icon left>file_download</Icon>
					 	</Button>
					 </Col>
					 <Col s={6} className="center">
			 			{uploadDataButton}
			 	 	</Col>
					<Col s={12}>
						<br/>
						<a href="#" className="blue-text text-darken-3" onClick={() => {this.hanldeNewFile();}}>
						 	<Icon left>insert_drive_file</Icon>
							Traducir otro archivo
						</a>
					</Col>
				</Row>)
			: (null);

		return(
			<div>
				<Row>
					<Col s={12} m={10} l={8} offset="m1 l2">
						<Card>
							{selectFileOption}
							{loadingParseFile}
							{fileParsedOptions}
							{loadingInsertData}
						</Card>
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
