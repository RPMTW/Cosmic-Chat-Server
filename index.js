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
const log = new Discord.WebhookClient("832853964819136532", process.env['WebHookToken']);

let onlineCount = 0;
let isready = false;

require("./discord/init")(client, log)

client.on("message", async (msg) => {
  if (msg.author.bot) return;
  if (msg.channel.id === "831494456913428501") {
    let data;
    if (msg.reference) { //如果該訊息是回覆的訊息
      msg.channel.messages.fetch(msg.reference.messageID).then(message => {
        let tag = message.author.tag;
        if (tag === msg.author.tag) {
          tag = "自己"
        }
        data = { "Type": "Client", "Message": `§a回覆 §6${tag} §b${message.content} §a-> §f${msg.content}`, "UserName": msg.author.tag, "IP": "" }
        log.send(data);
        io.emit("broadcast", data);
      })
        .catch(console.error);

    } else {
      data = { "Type": "Client", "Message": msg.content, "UserName": msg.author.tag, "IP": "" }
      log.send(data);
      io.emit("broadcast", data);
    }
  }
});

client.on('ready', () => {
  isready = true;
})

io.on('connection', function(socket) {
  onlineCount++;
  if (isready) {
    client.user.setActivity(`宇宙通訊共有 ${onlineCount} 個玩家`, { type: 'WATCHING' })
      .catch(console.error);
  }
  try {
    socket.on('message', function(data) {
      console.log('new data: ' + data);
      let JsonData = JSON.parse(data);
      let Message = JsonData.Message;
      let UserName = JsonData.UserName;
      let UUID = JsonData.UUID;
      let IP = JsonData.IP;

      if (Message == null) return;

      log.send(data);

      if (BanIp.includes(IP)) {
        data = `{\"Type\":\"Server\",\"Message\":\"Ban\",\"UserName\":\"${UserName}\",\"UUID\":\"${UUID}\",\"IP\":\"${IP}\"}`
        io.emit("broadcas", data);
        return;
      };

      require("./discord/SendMessage")("831494456913428501", client, Message, UUID, UserName)
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