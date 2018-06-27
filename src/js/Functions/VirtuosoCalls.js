import axios from 'axios';

const virtuosoUrl =  'http://localhost:8890/sparql/';

export function performQuery(query, callback){
    const querystring = require('querystring');
    // let resp = null;
    axios.post(virtuosoUrl,
        querystring.stringify({'query': query})
    )
    .then((response) => {
        // console.log(response);
        // return response;
        callback(response);
    })
    .catch((error) => {
        console.log(error);
        // return error;
    });

    // return resp;
}
