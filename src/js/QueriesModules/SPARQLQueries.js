const graphURI = '<http://www.sensores.com/ontology/prueba03/extrusoras#>';
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
 // 		- filter['startDate']: STRING ('yyy-mm-dd')
 // 		- filter['endDate']: STRING ('yyy-mm-dd')
 // 		- filter['filterTime']: true or false
 // 		- filter['startTime']: STRING ('HH:MM:ss')
 // 		- filter['endTime']: STRING ('HH:MM:ss')
 // 	orderBy: Collection
 // 		- orderBy['orderBy']: true or false
 // 		- orderBy['order']: 'desc' or 'asc'
 // 		- orderBy['orderField']: 'value', 'dateTime', 'date', 'sensorId'
export function getInformationQuery(sensors, groupBy, filter, orderBy){

	const prefixes = 'base ' + graphURI + ' ' +
		'prefix : ' + graphURI + ' ' +
		'prefix sosa: <http://www.w3.org/ns/sosa/> ';

	const select = getSelect(groupBy);

	const from = 'from ' + graphURI + ' ';

	let where = 'where { ';

	sensors.forEach((value, i) => {
		if (i === 0){
			where += '{ ' +
				'<#sensor' + value +'> sosa:madeObservation ?obsName . ' +
				'bind(<#sensor' + value +'> as ?sensorName) ' +
				'} ';
		}
		else{
			where += 'union { ' +
				'<#sensor' + value +'> sosa:madeObservation ?obsName . ' +
				'bind(<#sensor' + value +'> as ?sensorName) ' +
				'} ';
		}
	});
	where += '?obsName sosa:hasResult/sosa:hasSimpleResult ?resultValue . ' +
    	'?obsName sosa:resultTime ?resultTime . ';

    if (groupBy['groupByDate']) {
    	where += 'bind(xsd:date(xsd:dateTime(?resultTime)) as ?resultDate) ';
    }
    else if(groupBy['groupByHour']){
    	where += 'bind(xsd:time(xsd:dateTime(?resultTime)) as ?time) . ' +
    		'bind(substr(str(?time), 1, 2) as ?hour) . ' +
    		'bind(concat(?hour, ":00:00") as ?resultHour) . ';
    }

    if (filter['filter']){
    	where = getFilter(where, filter);
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

// 	knownSensors: Collection
// 		{'sensorName':sensorValue, ...}
// 			or
// 		{'sensorName':'min'/'max', ...}
// 	askedSensors: Array
// 	quitarAnomalias: true or false
export function getOtherSensorQuery(knownSensors, askedSensors, quitarAnomalias, orderByDate){
	const prefixes = 'base ' + graphURI + ' ' +
		'prefix : ' + graphURI + ' ' +
		'prefix sosa: <http://www.w3.org/ns/sosa/> ';

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

			if (quitarAnomalias){
				where += 'filter(?calResultValue < 3000 && ?calResultValue > 0) . ';
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

	askedSensors.forEach((value,i) => {
		if (i === 0){
			where += '{ ' +
				'<#sensor' + value +'> sosa:madeObservation ?askedObs . ' +
				'?askedObs sosa:hasResult/sosa:hasSimpleResult ?resultValue . ' +
				'?askedObs sosa:resultTime ?resultTime . ' +
				'bind(<#sensor' + value +'> as ?sensorName) ' +
				'} ';
		}
		else{
			where += 'union { ' +
				'<#sensor' + value +'> sosa:madeObservation ?askedObs . ' +
				'?askedObs sosa:hasResult/sosa:hasSimpleResult ?resultValue . ' +
				'?askedObs sosa:resultTime ?resultTime . ' +
				'bind(<#sensor' + value +'> as ?sensorName) ' +
				'} ';
		}
	});

	where += '} ';

	let finalQuery = prefixes + select + from + where;

	if (orderByDate){
		finalQuery += 'order by desc(?resultTime) ';
	}

	return finalQuery;
}

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

function getFilter(where, filter){
	where += 'filter( ';
    	if (filter['filterTime'] && filter['filterDate']){
   			where += ' xsd:dateTime(?resultTime) >= "' + filter['startDate'] + 'T00:00:00.000Z"^^xsd:dateTime && ' +
            	'xsd:dateTime(?resultTime) < "' + filter['endDate'] + 'T23:59:59.999Z"^^xsd:dateTime && ' +
    			'xsd:time(xsd:dateTime(?resultTime)) >= "' + filter['startTime'] + '.000Z"^^xsd:time && ' +
            	'xsd:time(xsd:dateTime(?resultTime)) <= "' + filter['endTime'] + '.999Z"^^xsd:time ';
    	}
    	else if (filter['filterDate']){
    		where += ' xsd:dateTime(?resultTime) >= "' + filter['startDate'] + 'T00:00:00.000Z"^^xsd:dateTime && ' +
            	'xsd:dateTime(?resultTime) < "' + filter['endDate'] + 'T23:59:59.999Z"^^xsd:dateTime ';
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
