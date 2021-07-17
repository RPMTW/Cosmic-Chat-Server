module.exports = async(client,log) => {
  client.login(process.env['DiscordToken']).then(r => {
    console.log(`${client.user.username} 登入成功`)
    log.send(`${client.user.username} 登入成功`)
})
}

