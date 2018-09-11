class InformationQueryForm extends React.Component{
	...

	render(){
		const selectedSensors = this.props.selectedSensors;
		const infoSensors = this.props.infoSensors;
		...

		return(
				<div>
					...
				</div>
		)
	}
}

class SelectQueryTabs extends React.Component{
	...

	render(){
		let selectedSensorsVar = ["idSensor1", "idSensor1", ...]
		let infoSensorsVar = [{"id":"idSensor1", "name":"Nombre Sensor 1", ...}, ...]
		...

		return(
			<div>
				...
				<InformationQueryForm
					selectedSensors={selectedSensors}
					infoSensors={infoSensors}
					...
				/>
				...
			</div>
		)
	}
}

class SelectPage extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			selectedPage: 'preguntas',
			...
		};
	}
	...

	mostrarPreguntas(){
		this.setState({
			selectedPage: 'preguntas',
		});
	}

	mostrarTraductorDatos(){
		this.setState({
			selectedPage: 'datos',
		});
	}

																				|

	render(){
		const content = (this.state.selectedPage === 'preguntas')
			? (<QueriesPage ... />)
			: (<DataPage ... />);

		const sideNav =
			(...<li>
					<button onClick={() => this.mostrarPreguntas()}>
						Consultar datos
					</button>
				</li>
				<li>
					<button onClick={() => this.mostrarTraductorDatos()}>
						Insertar datos
					</button>
				</li>...);
		...

		return(
			<div>
				<div className='navBar'>
					...
					{sideNav}
				</div>
				{content}
			</div>
		)
	}
}


export class QueriesPage extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			machines: {},
			...
		};
	}

	componentDidMount(){
		const idOrg = this.props.idOrganization;

		const maquinas = // Recopilar información de las máquinas de la
						// organización cuyo id es 'idOrg'

		this.setState({
			machines: maquinas,
		});
	}

	...
}

class InformationQueryForm extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			fechaInicio: '',
			fechaFin: '',
			...
		};
	}

	handleFechaInicio(event, value){
		...
		this.setState({
			fechaInicio: value,
			...
		});
	}

	handleFechaFin(event, value){
		...
		this.setState({
			fechaFin: value,
			...
		});
	}

	handleSubmit(){
		const fechaInicio = this.state.fechaInicio;
		const fechaFin = this.state.fechaFin;
		...
		this.props.getInformationQuery({'startDate':fechaInicio,'endDate':fechaFin,...}, ...);
	}

	...																							|

	...

	render(){
		...
		return(
				...
				<li>
					<div ...>
						 Filtrar resultados por fechas
					</div>
					<div ...>
		 				<input type='date' label="Desde..."
		 					onChange={(e, value) => {this.handleFechaInicio(e, value);}}/>
		 			</div>
					<div>
		 				<input type='date' label="Hasta..."
		 					onChange={(e, value) => {this.handleFechaFin(e, value);}}/>
					</div>
				</li>
				...
				<li>
					<button  onClick={() => {this.handleSubmit();}}>
						Consultar
					</button>
				</li>
				..
		)
	}
}

class InsertDataForm extends React.Component {
	constructor(props) {
	    super(props);
	    this.fileInput = React.createRef();
	    this.state = {
			...
	    }
 	}

	handleInsertData(){
		const selectedFile = this.fileInput.files;
		const fileName = selectedFile[0].name;
		...
	}

	render(){
		...

		return(
			<div>
				...
				Fichero
				<input type="file" ref={input => {this.fileInput = input;}}/>
			 	...
				<button onClick={() => this.handleInsertData()}>
					Comenzar con la inserción de datos.
				</button>
			</div>
		)
	}

<Button className='blue darken-3' ... >
	Consultar
	<Icon right>
		bar_chart
	</Icon>
</Button>


<a className='btn blue darken-3' ...>
	Consultar
	<i className='material-icons right'>
		bar_chart
	</i>
</a>
