import React from 'react';
import ReactDOM from 'react-dom';
import '../../index.css';
import * as Queries from '../Functions/SPARQLQueries.js';
import {Row, Col, Button, Card, Icon} from 'react-materialize'
import M from 'materialize-css';
import axios from 'axios';

const RESTfulURLFile = 'http://localhost:8080/VirtuosoPruebaWeb2/rest/service/insertfile';

export class PruebaInsert extends React.Component {
	constructor(props){
		super(props);
		// this.state = {
		// 	httpRespuesta: '',
		// };
	}

    handleClick(){
        var file = new Blob(["Prueba 2. \n Veamos si funciona. \n"], {type: "text/plain"});

        var formData = new FormData();
        formData.append("file", file);
        axios.post(RESTfulURLFile, formData, {
            headers: {
                 'Content-Type': 'multipart/form-data'
            }
        })
		.then((response) => {
			console.log(response);
		})
		.catch((error) => {
			console.log(error);
		});
    }

    handleSubmit(event){
		const selectedFile = this.fileInput.files[0];

        var formData = new FormData();
        formData.append("file", selectedFile);
        axios.post(RESTfulURLFile, formData, {
            headers: {
                 'Content-Type': 'multipart/form-data'
            }
        })
		.then((response) => {
			console.log(response);
		})
		.catch((error) => {
			console.log(error);
		});

	}

	render(){

		return(
			<Card>
                <p>Pruebas de enviar archivos</p>
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
                    <Icon className='blue-text darken-3'>arrow_upward</Icon>
                    Prueba pasar archivo mediante post
                </a>
                <br/>
                Crear archivo propio y pasarlo mediante post: <Button className="blue darken-3" onClick={() => this.handleClick()}>Crear y subir</Button>
			</Card>
		)
	}
}
