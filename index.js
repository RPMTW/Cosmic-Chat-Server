const express = require('express');
const app = express();
const fs = require('fs');
const BanIp = JSON.parse(fs.readFileSync("./Ban/IP.json"));
const http = require('http');
const server = http.Server(app);

const sockets = require('socket.io');
io = sockets(server);

const Discord = require('discord.js');
const client = new Discord.Client();
const log = new Discord.WebhookClient("832853964819136532", process.env['WebHookToken']);
const Swearing = fs.readFileSync("./Ban/not_message.txt").toString().split("\n");
const { FormattingCodeToMD } = require("./Function/FormattingCodeConverter");

let onlineCount = 0;
let isReady = false;

var TooManyRequests = {}

require("./discord/init")(client, log)

client.on('ready', () => {
  isReady = true;
})

client.on("message", async (msg) => {
  if (msg.author.bot) return;
  if (msg.channel.id === "831494456913428501") {
    if (Swearing.includes(msg.content)) {
      // 防髒話系統
      return msg.delete()
    }
    if (msg.reference) {
      //如果該訊息是回覆的訊息
      msg.channel.messages.fetch(msg.reference.messageID).then(message => {
        let tag = message.author.tag;
        if (tag === msg.author.tag) {
          tag = "自己"
        }
        let data = { "Type": "Client", "Message": `§a回覆 §6${tag} §b${message.content} §a-> §f${msg.content}`, "UserName": msg.author.tag, "IP": "" }
        io.emit("broadcast", data);
      })
        .catch(console.error);
    } else {
      let data = { "Type": "Client", "Message": await FormattingCodeToMD(msg.content), "UserName": msg.author.tag, "IP": "" }
      io.emit("broadcast", data);
    }
  }
});

io.on('connection', function(socket) {
  onlineCount++; //增加連線數
  if (isReady) {
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

      // 如果訊息無效則結束
      if (Message == null) return;
      // 如果該IP已經被Ban
      if (BanIp.includes(IP)) {
        data = `{\"Type\":\"Server\",\"Message\":\"Ban\",\"UserName\":\"${UserName}\",\"UUID\":\"${UUID}\",\"IP\":\"${IP}\"}`;
        return io.emit("broadcast", data);
      };
      // 防髒話
      if (Swearing.includes(Message)) return log.send(`偵測到髒話，訊息內容 ${Message}，IP ${IP}，UUID ${UUID}， UserName ${UserName}`);
      // 防刷訊息
      if (TooManyRequests.hasOwnProperty(IP)) {
        let t = TooManyRequests[IP];
        if ((new Date() - t["time"]) <= 2000) {
          // 相差是否大於2s
          if (++t["ViolationCount"] > 10) {
            log.send(`偵測到發送訊息過快，訊息內容 ${Message}，IP ${IP}，UUID ${UUID}， UserName ${UserName}`);
            BanIp["IP"].push(IP); //將IP加入BanIP
            fs.writeFile('./Ban/IP.json', JSON.stringify(BanIp, null, 4), error => {
              if (error) console.log(error);
            });
          }
        }
        t["time"] = new Date();
      } else {
        TooManyRequests[IP] = { "time": new Date(), "ViolationCount": 0 };
      }

      log.send(data); //發送訊息到Discord後台

      require("./discord/SendMessage")("831494456913428501", client, Message, UUID, UserName); //發送訊息到Discord宇宙通訊頻道
      data = `{\"Type\":\"Client\",\"Message\":\"${FormattingCodeToMD(Message)}\",\"UserName\":\"${UserName}\",\"UUID\":\"${UUID}\",\"IP\":\"${IP}\"}`;
      io.emit("broadcast", data); //推播訊息給客戶端
    });
    socket.on('disconnect', () => {
      onlineCount = (onlineCount < 0) ? 0 : onlineCount -= 1; //減少連線數
    });
  } catch (err) {
    console.log(err);
  }
});

server.listen(3000, function() {
  console.log('listening on 3000');
});