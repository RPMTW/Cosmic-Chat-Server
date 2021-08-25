const fetch = require('node-fetch');

async function MojangAuth(accessToken) {
    var headers = new fetch.Headers();
    headers.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "accessToken": accessToken
    });

    var requestOptions = {
        method: 'POST',
        headers: headers,
        body: raw,
        redirect: 'follow'
    };

   return await fetch("https://authserver.mojang.com/validate", requestOptions)
        .then(response => {
           return response.status == 204;
        })
        .catch(error => console.log('error', error));
}

exports.MojangAuth = MojangAuth