module.exports = async (ChannelID, client, Msg, UUID, UserName) => {
  let ischannel = client.channels.cache.find(channel => channel.id === ChannelID);
  if (!ischannel) return;
  try {
    const channel = client.channels.cache.get(ChannelID);
    const webhooks = await channel.fetchWebhooks();
    const webhook = webhooks.first();
    webhook.send(Msg, {
      username: UserName,
      avatarURL: `https://crafatar.com/avatars/${UUID}`
    });
  } catch (error) {
    console.error('Error trying to send: ', error);
  }
};