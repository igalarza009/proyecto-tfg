import React from 'react';
import '../../index.css';
import * as Parser from './ParseToRDF.js';
import {Row, Col, Card, Icon, Button} from 'react-materialize'
import Papa from 'papaparse';
import M from 'materialize-css';
import axios from 'axios';
import {PruebaInsert} from '../Pruebas/PruebasInsert.js'
import $ from 'jquery';

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
	    }
 	}

	componentDidMount(){
		$(document).ready(function(){
		    $('.collapsible').collapsible();
		});
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
		if (this.state.fileUploaded){
			alert("The file has already been uploaded.")
		}
		else{
			const file = this.state.file;

			// var formData = new FormData();
			// formData.append("file", file);
			// axios.post(RESTfulURLInsert, formData, {
			// 	headers: {
			// 		 'Content-Type': 'multipart/form-data'
			// 	}
			// })
			// .then((response) => {
			// 	console.log(response);
				this.setState({
					fileUploaded: true,
				})
			// })
			// .catch((error) => {
			// 	console.log(error);
			// });
			alert("Se subiría el archivo a Virtuoso.");
		}
	}

	hanldeNewFile(){
		this.setState({
			selectFile: true,
	    	parsingFile: false,
			parsingEnded: false,
			file: null,
			fileName: null,
			fileUploaded: false,
		});
	}

	render(){
		const loading = (this.state.parsingFile)
			? (<div>
					<p> Traduciendo fichero... </p>
					<img className='loading'alt='Cargando' src={require('../../img/loading_bars.gif')}/>
				</div>)
			: (null);

		const uploadFile = (this.state.selectFile)
			? (<form action="#">
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
				</form>)
			: (null);

		const parseFile = (this.state.selectFile)
			? (<a href='#' className="blue-text darken-3 valign-wrapper" onClick={() => this.handleParseFile()}>
					<Icon className='blue-text darken-3'>cached</Icon>
					Traducir archivo a formato RDF.
				</a>)
			: (null);

		const fileUploaded = (this.state.parsingEnded)
			? (<p>El fichero  {this.state.fileName}  ha sido correctamente traducido a RDF.</p>)
			: (null);

		const downloadFile = (this.state.parsingEnded)
			? (<Col s={6}>
					<Button className="blue darken-3 valign-wrapper" onClick={() => this.handleDownload()}>
						<Icon>file_download</Icon>
						Descargar archivo
					</Button>)
				</Col>)
			: (null);

		const insertDataVirtuoso = (this.state.parsingEnded)
			? (<Col s={12}>
					<Button className="blue darken-3 valign-wrapper" onClick={() => this.handleUpload()}>
						<Icon>arrow_upward</Icon>
						Insertar datos
					</Button>
				</Col>)
			: (null);

		const newfile = (this.state.parsingEnded)
			? (<a href="#" className="blue-text darken-3-text" onClick={() => {this.hanldeNewFile();}}>
					Subir nuevo archivo
				</a>)
			: (null);

		return(
			<div>
			<Row s={12}>
				<Card>
						{uploadFile}
						{parseFile}
						{fileUploaded}
						{downloadFile}
						{insertDataVirtuoso}
						{loading}
						{newfile}
				</Card>
			</Row>
			{/* <Row>
				<PruebaInsert />
			</Row> */}
			{/* <Row>
				<ul className="collapsible" data-collapsible="expandable">
				   <li>
					 <div className="collapsible-header no-pointer"><i className="material-icons">filter_drama</i>No se abre</div>
				   </li>
				   <li>
					 <div className="collapsible-header">Second<i className="material-icons">keyboard_arrow_down</i></div>
					 <div className="collapsible-body"><span>Lorem ipsum dolor sit amet.</span></div>
				   </li>
				   <li>
					 <div className="collapsible-header"><i className="material-icons">whatshot</i>Third</div>
					 <div className="collapsible-body"><span>Lorem ipsum dolor sit amet.</span></div>
				   </li>
				 </ul>
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
