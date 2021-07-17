module.exports = async (client, io) => {
  client.on("message", async (msg) => {
    if (msg.author.bot) return;
    if (msg.channel.id === "831494456913428501") {
      let data = { "Type": "Client", "Message": msg.content, "UserName": msg.author.tag,"IP":"127.0.1"}
      io.emit("broadcast", data);
    }
  });
};