module.exports = async (ChannelID, client, Msg, UUID, UserName) => {
  let ischannel = client.channels.cache.find(channel => channel.id === ChannelID);
  if (!ischannel) return;
  try {
    const channel = client.channels.cache.get(ChannelID); //取得該頻道的Webhook
    const webhooks = await channel.fetchWebhooks();
    const webhook = webhooks.first();
    webhook.send(Msg, {
      username: UserName, //玩家名稱
      avatarURL: `https://crafatar.com/avatars/${UUID}` //Skin圖片網址
    });
  } catch (error) {
    console.error('Error trying to send: ', error);
  }
};