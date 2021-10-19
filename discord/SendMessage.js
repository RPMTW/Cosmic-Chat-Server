module.exports = async (ChannelID, client, Msg, UUID, UserName) => {
  let ischannel = client.channels.cache.find(channel => channel.id === ChannelID);
  if (!ischannel) return;
  try {
    const channel = client.channels.cache.get(ChannelID); //取得該頻道的Webhook
    const webhooks = await channel.fetchWebhooks();
    const webhook = webhooks.first();
    console.log(UUID);
    webhook.send({content: Msg,username: UserName,avatarURL: `https://crafthead.net/avatar/${UUID}.png`});

  } catch (error) {
    console.error('Error trying to send: ', error);
  }
};