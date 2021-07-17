const express = require('express');
const app = express();
const fs = require('fs');
const BanIp = JSON.parse(fs.readFileSync("./Ban/IP.json")).IP;
const http = require('http');
const server = http.Server(app);

const sockets = require('socket.io');
io = sockets(server);

const Discord = require('discord.js');
const client = new Discord.Client()
const log = new Discord.WebhookClient("832853964819136532", "aFO1hTRZsle1vUnVBCYIP6xWrXkSkelgNRSIe47bYs1URmRLafZPEiFzy6yb9DtdKWs-");

let onlineCount = 0;

require("./discord/init")(client, log)
require("./discord/SendToGame")(client, io)

io.on('connection', function(socket) {
  console.log(onlineCount)
  onlineCount++;
  try {
    socket.on('message', function(data) {
      console.log('new data: ' + data);
      let JsonData = JSON.parse(data);
      let Message = JsonData.Message;
      let UserName = JsonData.UserName;
      let IP = JsonData.IP;
      if (BanIp.includes(IP)) {
        data = `{\"Type\":\"Server\",\"Message\":\"Ban\",\"UserName\":\"${UserName}\",\"UUID\":\"${JsonData.UUID}\",\"IP\":\"${IP}\"}`
        io.emit("broadcast", data);
        return;
      };
      require("./discord/SendMessage")("831494456913428501", client, `**<${UserName}>** ${Message}`)
      io.emit("broadcast", data);
    });
    socket.on('disconnect', () => {
      onlineCount = (onlineCount < 0) ? 0 : onlineCount -= 1;
    });
  } catch (err) {
    console.log(err)
  }
});


server.listen(3000, function() {
  console.log('listening on 3000');
});