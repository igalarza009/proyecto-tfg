fixingCompleted(fileName, parsedValues, parsedTimestamps){
    this.setState({
        insertState: 'insertingData',
    })

    let infoForParsing = Parser.getInfoToParseData(fileName, this.props.infoSensores, this.props.graphURI);

    let dataToInsert = '';
    let cont = 0;
    let i = 0;
    let wholeData = '';

    let tiempo = new Date();
    console.log("Tiempo inicio " + tiempo);
    this.insertDataRecursive(i, cont, parsedValues, parsedTimestamps, infoForParsing['virtPrefixes'], infoForParsing['sensorName'], infoForParsing['observationType'], infoForParsing['valueType'], dataToInsert, wholeData);
    // this.insertDataRecursiveList(i, parsedValues, parsedTimestamps, infoForParsing['virtPrefixes'], infoForParsing['sensorName'], infoForParsing['observationType'], infoForParsing['valueType'], wholeData);
}

insertDataRecursive(index, cont, values, timestamps, prefixes, sensorName, observationType, valueType, dataToInsert, wholeData){
	dataToInsert += Parser.parseDataRecursive(index, values, timestamps, prefixes, sensorName, observationType, valueType);

	index++;
	cont++;

	if(index < values.length){
		if (cont === 21){
			// -------------------- CAMBIAR PARA LA UNIÓN DE I4TSPS --------------------
			// Comentar esto:
			var query = Queries.getInsertQueryLocal(prefixes, dataToInsert, this.props.graphURI);
			// console.log(query);
			// Descomentar esto:
			// var query = Queries.getInsertQueryDebian(prefixes, dataToInsert, this.props.graphURI);
			// -------------------------------------------------------------------------
			axios.post(this.props.usedURL,
				querystring.stringify({'query': query})
			)
			.then((response) => {
				wholeData += dataToInsert;
				dataToInsert = '';
				cont = 0;
				this.insertDataRecursive(index, cont, values, timestamps, prefixes, sensorName, observationType, valueType, dataToInsert, wholeData);
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
		else{
			this.insertDataRecursive(index, cont, values, timestamps, prefixes, sensorName, observationType, valueType, dataToInsert, wholeData);
		}
	}
	else{
		if (cont > 0) {
			console.log('Ultima petición');

			// -------------------- CAMBIAR PARA LA UNIÓN DE I4TSPS --------------------
			// Comentar esto:
			var query = Queries.getInsertQueryLocal(prefixes, dataToInsert, this.props.graphURI);
			// Descomentar esto:
			// var query = Queries.getInsertQueryDebian(prefixes, dataToInsert, this.props.graphURI);
			// -------------------------------------------------------------------------

			axios.post(this.props.usedURL,
				querystring.stringify({'query': query})
			)
			.then((response) => {
				console.log(response);
				let tiempo = new Date();
				console.log("Tiempo Final " + tiempo);
				wholeData += dataToInsert;
				this.setState({
					dataInserted: true,
			        insertingData: false,
					insertState: "",
					fileContent: wholeData,
				})
			})
			.catch((error) => {
				console.log(error);
			});
		}
	}
}
