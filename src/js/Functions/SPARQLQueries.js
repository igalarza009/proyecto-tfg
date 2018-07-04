// const graphURI = '<http://www.sensores.com/ontology/prueba04/extrusoras#>';
// const graphURI = '<http://www.sensores.com/ontology/prueba08/extrusoras#>';
// const graphURI = "<http://www.sensores.com/ontology/pruebas_insert/extrusoras#>";
const graphURI = '<http://www.sensores.com/ontology/pruebas_fixed/extrusoras#>';

var _ = require('lodash');

 // 	sensors: Array of selected sensors
 // 	groupBy: Collection
 // 		- groupBy['groupBy']: true or false
 // 		- groupBy['groupByDate']: true or false
 // 		- groupBy['groupByHour']: true or false
 //			- groupBy['groupByAll']: true or false
 // 		- groupBy['avg']: true or false
 // 		- groupBy['min']: true or false
 // 		- groupBy['max']: true or false
 // 	filter: Collection
 // 		- filter['filter']: true or false
 // 		- filter['filterDate']: true or false
 // 		- filter['startDate']: STRING ('yyyy-mm-dd')
 // 		- filter['endDate']: STRING ('yyyy-mm-dd')
 // 		- filter['filterTime']: true or false
 // 		- filter['startTime']: STRING ('HH:MM:ss')
 // 		- filter['endTime']: STRING ('HH:MM:ss')
 // 	filterValues: Collection
// 			- filterValues['filter']: true or false
// 			- filtervalues['values']: {'XXXXX':[startvalue, finalValue] OR [true/false], ... }
// 										--> XXXXX = sensorId
 // 	orderBy: Collection
 // 		- orderBy['orderBy']: true or false
 // 		- orderBy['order']: 'desc' or 'asc'
 // 		- orderBy['orderField']: 'value', 'dateTime', 'date', 'sensorId'
 // 	split: Collection
 // 		- split['firstSegment']: true or false
 // 		- split['lastTimestamp']: STRING (timestamp)
  // 		- split['limit']: Integer

export function getInformationQueryIndividual(sensorId, groupBy, filter, filterValues, orderBy){

	const prefixes = 'base ' + graphURI + ' ' +
		'prefix : ' + graphURI + ' ' +
		'prefix sosa: <http://www.w3.org/ns/sosa/> ' +
		'prefix xsd: <http://www.w3.org/2001/XMLSchema#> ';

	const select = getSelect(groupBy);

	const from = 'from ' + graphURI + ' ';

	let where = 'where { ';

	where += '?sensorName sosa:madeObservation ?obsName . ' +
			'?obsName sosa:hasResult/sosa:hasSimpleResult ?resultValue . ' +
			'?obsName sosa:resultTime ?resultTime . ';

	if (filterValues['filter'] && filterValues['values'][sensorId]){
			where += 'filter(?resultValue  ';
			let sensorFilterValues = filterValues['values'][sensorId];
			// console.log(sensorFilterValues);
			if (typeof(sensorFilterValues[0]) === "boolean"){
				// console.log(sensorFilterValues[0] + " is NOT a number.");
				where += '= "' + sensorFilterValues[0] + '"^^xsd:boolean ';
			}
			else{
				console.log(sensorFilterValues[0] + " is a number.");
				where += '>= "' + sensorFilterValues[0] + '"^^xsd:double && ' +
						'?resultValue <= "' + sensorFilterValues[1] + '"^^xsd:double ';
			}
			where += '&& ?sensorName = <#sensor'+ sensorId +'> ) .';
	}
	else{
		where += 'filter( ?sensorName = <#sensor'+ sensorId +'> ) .';
	}

    if (groupBy['groupByDate']) {
    	where += 'bind(xsd:date(xsd:dateTime(?resultTime)) as ?resultDate) ';
    }
    else if(groupBy['groupByHour']){
    	where += 'bind(xsd:time(xsd:dateTime(?resultTime)) as ?time) . ' +
    		'bind(substr(str(?time), 1, 2) as ?hour) . ' +
    		'bind(concat(?hour, ":00:00") as ?resultHour) . ';
    }

    if (filter['filter']){
    	where += getFilter(filter);
    }

    where += '} ';

    let finalQuery = prefixes + select + from + where;

    if (groupBy['groupBy']){
    	finalQuery += getGroupBy(groupBy);
    }

    if (orderBy['orderBy'] && !groupBy['groupByAll']){
    	finalQuery += getOrderBy(orderBy, groupBy);
    }

    return finalQuery;
}

export function getInformationQueryIndividualSplit(sensorId, groupBy, filter, filterValues, orderBy, split){

	const prefixes = 'base ' + graphURI + ' ' +
		'prefix : ' + graphURI + ' ' +
		'prefix sosa: <http://www.w3.org/ns/sosa/> ' +
		'prefix xsd: <http://www.w3.org/2001/XMLSchema#> ';

	const select = getSelect(groupBy);

	const from = 'from ' + graphURI + ' ';

	let where = 'where { ';

	where += '?sensorName sosa:madeObservation ?obsName . ' +
			'?obsName sosa:hasResult/sosa:hasSimpleResult ?resultValue . ' +
			'?obsName sosa:resultTime ?resultTime . ';

	if (filterValues['filter'] && filterValues['values'][sensorId]){
			where += 'filter(?resultValue  ';
			let sensorFilterValues = filterValues['values'][sensorId];
			// console.log(sensorFilterValues);
			if (typeof(sensorFilterValues[0]) === "boolean"){
				// console.log(sensorFilterValues[0] + " is NOT a number.");
				where += '= "' + sensorFilterValues[0] + '"^^xsd:boolean ';
			}
			else{
				console.log(sensorFilterValues[0] + " is a number.");
				where += '>= "' + sensorFilterValues[0] + '"^^xsd:double && ' +
						'?resultValue <= "' + sensorFilterValues[1] + '"^^xsd:double ';
			}
			where += '&& ?sensorName = <#sensor'+ sensorId +'> ) .';
	}
	else{
		where += 'filter( ?sensorName = <#sensor'+ sensorId +'> ) .';
	}

    if (groupBy['groupByDate']) {
    	where += 'bind(xsd:date(xsd:dateTime(?resultTime)) as ?resultDate) ';
    }
    else if(groupBy['groupByHour']){
    	where += 'bind(xsd:time(xsd:dateTime(?resultTime)) as ?time) . ' +
    		'bind(substr(str(?time), 1, 2) as ?hour) . ' +
    		'bind(concat(?hour, ":00:00") as ?resultHour) . ';
    }

	if (!split['firstSegment']){
		where += 'filter( xsd:dateTime(?resultTime) >= "' + split['lastTimestamp'] + '"^^xsd:dateTime ) ';
	}

    if (filter['filter']){
    	where += getFilter(filter);
    }

    where += '} ';

    let finalQuery = prefixes + select + from + where;

    if (groupBy['groupBy']){
    	finalQuery += getGroupBy(groupBy);
    }

    if (orderBy['orderBy'] && !groupBy['groupByAll']){
    	finalQuery += getOrderBy(orderBy, groupBy);
    }

	finalQuery += 'limit ' + split['limit'];

    return finalQuery;
}

// export function getInformationQuery(sensors, groupBy, filter, filterValues, orderBy){
//
// 	const prefixes = 'base ' + graphURI + ' ' +
// 		'prefix : ' + graphURI + ' ' +
// 		'prefix sosa: <http://www.w3.org/ns/sosa/> ' +
// 		'prefix xsd: <http://www.w3.org/2001/XMLSchema#> ';
//
// 	const select = getSelect(groupBy);
//
// 	const from = 'from ' + graphURI + ' ';
//
// 	let where = 'where { ';
//
// 	sensors.forEach((value, i) => {
// 		if (i === 0)
// 			where += '{ ';
// 		else
// 			where += 'union { ';
//
// 		where += '?sensorName sosa:madeObservation ?obsName . ' +
// 				'?obsName sosa:hasResult/sosa:hasSimpleResult ?resultValue . ' +
// 			    '?obsName sosa:resultTime ?resultTime . ';
//
// 		if (filterValues['filter'] && filterValues['values'][value]){
// 				where += 'filter(?resultValue  ';
// 				let sensorFilterValues = filterValues['values'][value];
// 				console.log(sensorFilterValues);
// 				if (typeof(sensorFilterValues[0]) === "boolean"){
// 					console.log(sensorFilterValues[0] + " is NOT a number.");
// 					where += '= "' + sensorFilterValues[0] + '"^^xsd:boolean ';
// 				}
// 				else{
// 					console.log(sensorFilterValues[0] + " is a number.");
// 					where += '>= "' + sensorFilterValues[0] + '"^^xsd:double && ' +
// 							'?resultValue <= "' + sensorFilterValues[1] + '"^^xsd:double ';
// 				}
// 				where += '&& ?sensorName = <#sensor'+ value +'> ) .';
// 		}
// 		else{
// 			where += 'filter( ?sensorName = <#sensor'+ value +'> ) .';
// 		}
//
// 		where += '} ';
// 	});
//
//     if (groupBy['groupByDate']) {
//     	where += 'bind(xsd:date(xsd:dateTime(?resultTime)) as ?resultDate) ';
//     }
//     else if(groupBy['groupByHour']){
//     	where += 'bind(xsd:time(xsd:dateTime(?resultTime)) as ?time) . ' +
//     		'bind(substr(str(?time), 1, 2) as ?hour) . ' +
//     		'bind(concat(?hour, ":00:00") as ?resultHour) . ';
//     }
//
//     if (filter['filter']){
//     	where = getFilter(where, filter);
//     }
//
//     where += '} ';
//
//     let finalQuery = prefixes + select + from + where;
//
//     if (groupBy['groupBy']){
//     	finalQuery += getGroupBy(groupBy);
//     }
//
//     if (orderBy['orderBy'] && !groupBy['groupByAll']){
//     	finalQuery += getOrderBy(orderBy, groupBy);
//     }
//
//     return finalQuery;
// }

// 	knownSensors: Collection
// 		{'sensorName':sensorValue, ...}
// 			or
// 		{'sensorName':'min'/'max', ...}
// 	askedSensorId: string
// 	filterValues: Collection
// 			- filterValues['filter']: true or false
// 			- filtervalues['values']: {'XXXXX':[startvalue, finalValue] OR [true/false], ... }
// 										--> XXXXX = sensorId
// 	filter: Collection
// 		- filter['filter']: true or false
// 		- filter['filterDate']: true or false
// 		- filter['startDate']: STRING ('yyyy-mm-dd')
// 		- filter['endDate']: STRING ('yyyy-mm-dd')
// 		- filter['filterTime']: true or false
// 		- filter['startTime']: STRING ('HH:MM:ss')
// 		- filter['endTime']: STRING ('HH:MM:ss')
// 	orderBy: Collection
// 		- orderBy['orderBy']: true or false
// 		- orderBy['order']: 'desc' or 'asc'
// 		- orderBy['orderField']: 'value', 'dateTime', 'date', 'sensorId'
export function getOtherSensorQueryIndividual(knownSensors, askedSensorId, filterValues, filter, orderBy){
	const prefixes = 'base ' + graphURI + ' ' +
		'prefix : ' + graphURI + ' ' +
		'prefix sosa: <http://www.w3.org/ns/sosa/> '+
		'prefix xsd: <http://www.w3.org/2001/XMLSchema#> ';;

	let select = 'select ?sensorName ?resultValue ?resultTime ';

	const from = 'from ' + graphURI + ' ';

	let where = 'where { ';
	let i = 1;

	_.forEach(knownSensors, (value,sensorName) => {
		var obsName = 'knownObs' + i;

		if (isNaN(value)){
			var calObsName = 'calObs' + i;
			var calValName = 'calculatedValue' + i;

			where += '{ '
			if (value === 'min'){
				where += 'select (MIN(?calResultValue) as ?' + calValName + ') ';
			}
			else {
				where += 'select (MAX(?calResultValue) as ?' + calValName + ') ';
			}
			where += 'where { ' +
				'<#sensor' + sensorName + '> sosa:madeObservation ?' + calObsName + ' . ' +
				'?' + calObsName + ' sosa:hasResult/sosa:hasSimpleResult ?calResultValue . ';

			if (filterValues['filter'] && filterValues['values'][sensorName]){
					where += 'filter(?calResultValue  ';
					let sensorFilterValues = filterValues['values'][sensorName];
					if (typeof(sensorFilterValues[0]) === "boolean"){
						where += '= "' + sensorFilterValues[0] + '"^^xsd:boolean ';
					}
					else{
						where += '>= "' + sensorFilterValues[0] + '"^^xsd:double && ' +
								'?calResultValue <= "' + sensorFilterValues[1] + '"^^xsd:double ';
					}
					where += ' ) .';
			}

			where += ' } } ' ;

			where += '<#sensor' + sensorName + '> sosa:madeObservation ?' + obsName + ' . ' +
				'?' + obsName + ' sosa:hasResult/sosa:hasSimpleResult ?' + calValName + ' . ' +
				'?' + obsName + ' sosa:resultTime ?resultTime . ';
		}
		else {
			where += '<#sensor' + sensorName + '> sosa:madeObservation ?' + obsName + ' . ' +
				'?' + obsName + ' sosa:hasResult/sosa:hasSimpleResult "' + value + '"^^xsd:double . ' +
				'?' + obsName + ' sosa:resultTime ?resultTime . ';
		}
		i++;
	});

	where += '<#sensor' + askedSensorId +'> sosa:madeObservation ?askedObs . ' +
			'?askedObs sosa:hasResult/sosa:hasSimpleResult ?resultValue . ' +
			'?askedObs sosa:resultTime ?resultTime . ' +
			'bind(<#sensor' + askedSensorId +'> as ?sensorName) ';

	if (filter['filter']){
		  where += getFilter(filter);
	}

	where += '} ';

	let finalQuery = prefixes + select + from + where;

	if (orderBy['orderBy']){
    	finalQuery += getOrderBy(orderBy, {});
    }

	return finalQuery;
}

export function getInsertQuery(prefixes, dataToInsert){
	let query = prefixes;
	query += ' insert data { graph ' + graphURI + ' { ';
	query += dataToInsert;
	query += ' } } ';

	return query;
}

// export function getOtherSensorQuery(knownSensors, askedSensors, quitarAnomalias, orderBy){
// 	const prefixes = 'base ' + graphURI + ' ' +
// 		'prefix : ' + graphURI + ' ' +
// 		'prefix sosa: <http://www.w3.org/ns/sosa/> '+
// 		'prefix xsd: <http://www.w3.org/2001/XMLSchema#> ';;
//
// 	let select = 'select ?sensorName ?resultValue ?resultTime ';
//
// 	const from = 'from ' + graphURI + ' ';
//
// 	let where = 'where { ';
// 	let i = 1;
//
// 	_.forEach(knownSensors, (value,sensorName) => {
// 		var obsName = 'knownObs' + i;
//
// 		if (isNaN(value)){
// 			var calObsName = 'calObs' + i;
// 			var calValName = 'calculatedValue' + i;
//
// 			where += '{ '
// 			if (value === 'min'){
// 				where += 'select (MIN(?calResultValue) as ?' + calValName + ') ';
// 			}
// 			else {
// 				where += 'select (MAX(?calResultValue) as ?' + calValName + ') ';
// 			}
// 			where += 'where { ' +
// 				'<#sensor' + sensorName + '> sosa:madeObservation ?' + calObsName + ' . ' +
// 				'?' + calObsName + ' sosa:hasResult/sosa:hasSimpleResult ?calResultValue . ';
//
// 			if (quitarAnomalias){
// 				where += 'filter(?calResultValue < 3000 && ?calResultValue > 0) . ';
// 			}
//
// 			where += ' } } ' ;
//
// 			where += '<#sensor' + sensorName + '> sosa:madeObservation ?' + obsName + ' . ' +
// 				'?' + obsName + ' sosa:hasResult/sosa:hasSimpleResult ?' + calValName + ' . ' +
// 				'?' + obsName + ' sosa:resultTime ?resultTime . ';
// 		}
// 		else {
// 			where += '<#sensor' + sensorName + '> sosa:madeObservation ?' + obsName + ' . ' +
// 				'?' + obsName + ' sosa:hasResult/sosa:hasSimpleResult "' + value + '"^^xsd:double . ' +
// 				'?' + obsName + ' sosa:resultTime ?resultTime . ';
// 		}
// 		i++;
// 	});
//
// 	askedSensors.forEach((value,i) => {
// 		if (i === 0){
// 			where += '{ ' +
// 				'<#sensor' + value +'> sosa:madeObservation ?askedObs . ' +
// 				'?askedObs sosa:hasResult/sosa:hasSimpleResult ?resultValue . ' +
// 				'?askedObs sosa:resultTime ?resultTime . ' +
// 				'bind(<#sensor' + value +'> as ?sensorName) ' +
// 				'} ';
// 		}
// 		else{
// 			where += 'union { ' +
// 				'<#sensor' + value +'> sosa:madeObservation ?askedObs . ' +
// 				'?askedObs sosa:hasResult/sosa:hasSimpleResult ?resultValue . ' +
// 				'?askedObs sosa:resultTime ?resultTime . ' +
// 				'bind(<#sensor' + value +'> as ?sensorName) ' +
// 				'} ';
// 		}
// 	});
//
// 	where += '} ';
//
// 	let finalQuery = prefixes + select + from + where;
//
// 	if (orderBy['orderBy']){
//     	finalQuery += getOrderBy(orderBy, {});
//     }
//
// 	return finalQuery;
// }

function getSelect(groupBy){
	let select = 'select ?sensorName ';
	if (groupBy['groupBy']){
		if (groupBy['groupByDate']) {
	    	select += '?resultDate ';
	    }
	    else if (groupBy['groupByHour']){
	    	select += '?resultHour ';
	    }
		if (groupBy['avg']){
			select += ' (AVG(?resultValue) as ?avgValue) ';
		}
		if (groupBy['min']){
			select += ' (MIN(?resultValue) as ?minValue) ';
		}
		if (groupBy['max']){
			select += ' (MAX(?resultValue) as ?maxValue) ';
		}
	}
	else {
		select += '?resultValue ?resultTime ';
	}

	return select;
}

function getFilter(filter){
	let where = 'filter( ';
    	if (filter['filterTime'] && filter['filterDate']){
   			where += ' xsd:dateTime(?resultTime) >= "' + filter['startDate'] + 'T00:00:00.000Z"^^xsd:dateTime && ' +
            	'xsd:dateTime(?resultTime) <= "' + filter['endDate'] + 'T23:59:59.999Z"^^xsd:dateTime && ' +
    			'xsd:time(xsd:dateTime(?resultTime)) >= "' + filter['startTime'] + '.000Z"^^xsd:time && ' +
            	'xsd:time(xsd:dateTime(?resultTime)) <= "' + filter['endTime'] + '.999Z"^^xsd:time ';
    	}
    	else if (filter['filterDate']){
    		where += ' xsd:dateTime(?resultTime) >= "' + filter['startDate'] + 'T00:00:00.000Z"^^xsd:dateTime && ' +
            	'xsd:dateTime(?resultTime) <= "' + filter['endDate'] + 'T23:59:59.999Z"^^xsd:dateTime ';
    	}
    	else if (filter['filterTime']){
    		where += 'xsd:time(xsd:dateTime(?resultTime)) >= "' + filter['startTime'] + '.000Z"^^xsd:time && ' +
            	'xsd:time(xsd:dateTime(?resultTime)) <= "' + filter['endTime'] + '.999Z"^^xsd:time ';
    	}
    where += ') ';

    return where;
}

function getGroupBy(groupBy){
	let groupByQuery = 'group by ?sensorName ';
    if (groupBy['groupByDate']) {
    	groupByQuery += '?resultDate ';
    }
    else if(groupBy['groupByHour']){
    	groupByQuery += '?resultHour ';
    }

    return groupByQuery;
}

function getOrderBy(orderBy, groupBy){
	let orderByQuery = 'order by ' + orderBy['order'] + '(';
    if (orderBy['orderField'] === 'value'){
    	orderByQuery += '?resultValue';
    }
    else if (orderBy['orderField'] === 'sensorId'){
    	orderByQuery += '?sensorName';
    }
    else {
    	if (groupBy['groupByDate']) {
    		orderByQuery += '?resultDate';
    	}
    	else if(groupBy['groupByHour']){
    		orderByQuery += '?resultHour';
    	}
    	else{
    		orderByQuery += '?resultTime';
    	}
    }
    orderByQuery += ') desc(?sensorName) ';

    return orderByQuery;
}
