const Discord = require('discord.js');

module.exports = async (client, log) => {
  let result = await client.login(process.env['DiscordToken']);
  console.log(`${client.user.username} 登入成功`);
  log.send(`${client.user.username} 登入成功`);
  console.log("successful connect to discord");
}