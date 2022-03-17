const express = require('express');
const morgan = require("morgan")
const app = express();
const fs = require('fs');
const BanUUID = JSON.parse(fs.readFileSync("./Ban/UUID.json"));
const http = require('http');
const server = http.Server(app);
const sockets = require('socket.io');
io = sockets(server);
const Discord = require('discord.js');
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });

const { RateLimiterMemory } = require('rate-limiter-flexible');

const log = new Discord.WebhookClient({ id: "832853964819136532", token: process.env['WebHookToken'] });

const Swearing = fs.readFileSync("./Ban/not_message.txt").toString().split("\n");

const { FormattingCodeToMD } = require("./Function/FormattingCodeConverter");
const { MojangAuth } = require("./Function/MojangAuth");
const { MSAuth } = require("./Function/MSAuth");
const { UUIDAuth } = require("./Function/UUIDAuth");

let onlineCount = 0;
let isReady = false;

var TooManyRequests = {}

app
  .use(morgan("dev"))
  .get('/', function(req, res) {
    res.json({
      code: 200,
      message: "Hello RPMTW World"
    });
  });

require("./discord/init")(client, log)

const rateLimiter = new RateLimiterMemory(
  {
    points: 5,
    duration: 1,
  });

client.once('ready', () => {
  isReady = true;
})

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (msg.channel.id === "831494456913428501") {
    if (Swearing.includes(msg.content)) {
      // 防髒話系統
      return msg.delete();
    }
    let MDMsg = await FormattingCodeToMD(msg.content);
    if (msg.type.toString() == "REPLY") {
      //如果該訊息是回覆的訊息
      msg.channel.messages.fetch(msg.reference.messageId).then(message => {
        let tag = message.author.tag;
        if (tag === msg.author.tag) {
          tag = "自己"
        }
        if (tag === "菘菘#8663" || tag === "SiongSng") {
          tag = "§bRPMTW維護者";
        }
        let MDMessage = FormattingCodeToMD(message.content);
        let data = { "Type": "Client", "MessageType": "General", "Message": `§a回覆 §6${tag} §b${MDMessage} §a-> §f${MDMsg}`, "UserName": msg.author.tag }
        io.emit("broadcast", data);
      })
        .catch(console.error);
    } else {
      let data = { "Type": "Client", "MessageType": "General", "Message": MDMsg, "UserName": msg.author.tag }
      io.emit("broadcast", data);
    }
  }
});

io.on('connection', async function(socket) {
  console.log(onlineCount);
  const Token = socket.handshake.auth.Token;
  const UUID = socket.handshake.auth.UUID;
  try {
    await rateLimiter.consume(UUID);
  } catch (rejRes) {
    console.log("連線宇宙通訊伺服器超速");
    return socket.disconnect();
  }
  if (Token == undefined || UUID == undefined) return socket.disconnect();
  onlineCount++; //增加連線數
  const isAuth = true;
  // await UUIDAuth(UUID);
  // await MojangAuth(Token) == true ? true : await MSAuth(Token);
  if (!isAuth) {
    console.log("偵測到盜版帳號");
  }
  if (isReady) {
    client.user.setPresence({ activities: [{ name: `宇宙通訊共有 ${onlineCount} 個玩家`, type: 'WATCHING' }] });
  }

  try {
    socket.on('message', function(data) {
      console.log('new data: ' + data);
      let dcData = JSON.parse(data);
      dcData.UUID = UUID;
      log.send(`\`\`\`json\n${JSON.stringify(dcData)}\`\`\``); //發送訊息到Discord後台
      try {
        // 如果該使用者不是正版帳號
        if (!isAuth) {
          data = {
            'Type': "Server",
            'MessageType': 'Auth',
            'UUID': UUID
          }
          io.emit("broadcast", data);
        }

        // 如果該UUID已經被Ban
        if (BanUUID.includes(UUID)) {
          data = {
            'Type': "Server",
            'MessageType': 'Ban',
            'UUID': UUID
          }
          return io.emit("broadcast", data);
        };

        let JsonData = JSON.parse(data);
        let Message = JsonData.Message;
        let UserName = JsonData.UserName;
        let MessageType = JsonData.MessageType;

        // 如果訊息無效則跳過處理
        function isNull(str) {
          if (str == null) return true;
          if (str == "") return true;
          var regu = "^[ ] $";
          var re = new RegExp(regu);
          return re.test(str);
        }

        if (isNull(Message)) return;
        if (Message.includes("@everyone") || Message.includes("@here")) return;

        // 防髒話
        if (Swearing.includes(Message)) return log.send(`偵測到髒話，訊息內容 ${Message}，UUID ${UUID}， UserName ${UserName}`);
        // 防刷訊息
        if (TooManyRequests.hasOwnProperty(UUID)) {
          let t = TooManyRequests[UUID];
          if ((new Date() - t["time"]) <= 2000) {
            console.log("test2");
            // 相差是否大於2秒
            if (t["ViolationCount"] > 1) {
              log.send(`偵測到發送訊息過快，訊息內容 ${Message}，UUID ${UUID}， UserName ${UserName}`);
              BanUUID.push(UUID); //將UUID加入BanUUID
              fs.writeFile('./Ban/UUID.json', JSON.stringify(BanUUID, null, 4), error => {
                if (error) console.log(error);
              });
            }
          }
          t["time"] = new Date();
        } else {
          TooManyRequests[UUID] = { "time": new Date(), "ViolationCount": 0 };
        }

        if (MessageType == "General") {
          require("./discord/SendMessage")("831494456913428501", client, Message, UUID, UserName); //發送訊息到Discord宇宙通訊頻道
          data = { "Type": "Client", "MessageType": "General", "Message": FormattingCodeToMD(Message), "UserName": UserName };
          io.emit("broadcast", data); //推播訊息給遊戲客戶端
        }
      } catch (err) {
        console.log(err);
      }
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