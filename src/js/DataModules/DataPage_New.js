import React from 'react';
import '../../index.css';
import * as Parser from './ParseToRDF_New.js';
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
	    this.state = {
			selectFile: true,
	    	insertingData: false,
			dataInserted: false,
			file: null,
			fileName: null,
	    }
 	}

	handleInsertData(){
		const selectedFile = this.fileInput.files;
		const fileName = selectedFile[0].name;
		let parsedData = [];

		this.setState({
			insertingData: true,
			selectFile: false,
			fileName: fileName,
		});

		Papa.parse(selectedFile[0], {
			step: function(row) {
				parsedData.push(row.data[0]);
			},
			complete: (results) => {this.jsonParsingCompleted(fileName,parsedData)},
		});
	}

	jsonParsingCompleted(fileName, parsedData){
			console.log("CSV file parsed to JSON");
			var file = Parser.parseDataToRDF(fileName, parsedData, this.props.infoSensores);
			// Parser.parseDataToRDF_Sin(fileName, parsedData, this.props.infoSensores);
            console.log("Data inserted and TTL file created");
            this.setState({
                // file: file,
                dataInserted: true,
                insertingData: false,
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

	hanldeNewFile(){
		this.setState({
            selectFile: true,
	    	insertingData: false,
			dataInserted: false,
			file: null,
			fileName: null,
		});
	}

	render(){
        const fileName = this.state.fileName;

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
									placeholder="Subir archivo para insertar los datos."/>
							</div>
						</div>
					</form>
					<a href='#' className="blue-text text-darken-3 valign-wrapper" onClick={() => this.handleInsertData()}>
							<Icon className='blue-text text-darken-3 padding'>cloud_upload</Icon>
							Insertar datos en Virtuoso.
					</a>
				</div>)
			: (null);

        const loadingInsertData = (this.state.insertingData)
            ? (<div className="center">
                    <p> Insertando datos del fichero {fileName} en Virtuoso... </p>
                    <p> La operación puede tardar varios minutos. </p>
                    <img className='loading' alt='Cargando' src={require('../../img/loading_bars.gif')}/>
                </div>)
            : (null);

		const downloadFileOption = (this.state.dataInserted)
			? (<Row>
					<Col s={12} className="center">
						<p>Los datos del fichero {fileName} han sido correctamente insertados en Virtuoso.</p>
						<br/>
					</Col>
					<Col s={6} className="center">
                        <a href="#" className="blue-text text-darken-3" onClick={() => {this.handleDownload();}}>
                            <Icon left>file_download</Icon>
                            Descargar archivo en RDF (.ttl)
                        </a>
					 </Col>
					 {/* <Col s={6} className="center">
			 			{uploadDataButton}
			 	 	</Col> */}
					<Col s={12}>
						<br/>
                        <Button className="blue darken-3 valign-wrapper" onClick={() => this.hanldeNewFile()}>
							Nuevo archivo
							<Icon left>insert_drive_file</Icon>
					 	</Button>
					</Col>
				</Row>)
			: (null);

		return(
			<div>
				<Row>
					<Col s={12} m={10} l={8} offset="m1 l2">
						<Card>
							{selectFileOption}
							{loadingInsertData}
							{downloadFileOption}
						</Card>
					</Col>
				</Row>
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
