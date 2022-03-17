const fetch = require('node-fetch');

async function UUIDAuth(uuid) {
  var requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };

  return await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`, requestOptions)
    .then(response => {
      if (response.status == 200) return true;
      if (response.status == 429) {
        console.log("超速啦！");
        return true;
      } else {
        return false;
      }
    }).catch(error => console.log('error', error));
}

exports.UUIDAuth = UUIDAuth;