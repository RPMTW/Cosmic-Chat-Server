const express = require('express');
const app = express();

const http = require('http');
const server = http.Server(app);

const sockets = require('socket.io');
io = sockets(server);

let onlineCount = 0;

io.on('connection', function(socket) {
  onlineCount++;

  socket.on('message', function(data) {
    console.log('new message: ' + data);
    io.emit("broadcast", data);
  });
  socket.on('disconnect', () => {
    onlineCount = (onlineCount < 0) ? 0 : onlineCount -= 1;
  });
});


server.listen(3000, function() {
  console.log('listening on 3000');
});