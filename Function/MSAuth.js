const fetch = require('node-fetch');

async function MSAuth(AccessToken) {
    var headers = new fetch.Headers();
    headers.append('Authorization', `Bearer ${AccessToken}`);

    var requestOptions = {
        method: 'GET',
        headers: headers,
        redirect: 'follow'
    };

    return await fetch("https://api.minecraftservices.com/minecraft/profile", requestOptions)
        .then(response => {
             if(response.status == 429) console.log("超速啦！")
             return response.text();
        })
        .then(result => {
            try {
                result = JSON.parse(result);
                return result['id'] != null;
            } catch (err) {
                return false;
            }
        }).catch(error => console.log('error', error));
}

exports.MSAuth = MSAuth;