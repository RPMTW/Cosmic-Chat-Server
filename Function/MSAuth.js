async function MSAuth(AccessToken) {
    var headers = new fetch.Headers();
    headers.append('Authorization', `Bearer ${AccessToken}`);

    var requestOptions = {
        method: 'GET',
        headers: headers,
        redirect: 'follow'
    };

    return await fetch("https://api.minecraftservices.com/minecraft/profile", requestOptions)
        .then(response => response.json())
        .then(result => {
            return result['id'] != null;
        }).catch(error => console.log('error', error));
}

exports.MSAuth = MSAuth