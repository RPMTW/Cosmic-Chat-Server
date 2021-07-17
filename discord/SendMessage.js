module.exports = async(ChannelID, client, Msg) => {
  let channel = client.channels.cache.find(channel => channel.id === ChannelID);
  if (!channel) return;
  channel.send(Msg);
};