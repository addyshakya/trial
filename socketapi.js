const io = require("socket.io")();
const socketapi = {
  io: io,
  messages: [] // To store chat messages
};

io.on("connection", function (socket) {
  console.log("A user connected");

  // Send chat history to the connecting user
  socket.emit("chatHistory", socketapi.messages);

  socket.on("message", function (msg) {
    console.log(msg);
    // Broadcast the message to all connected users
    io.emit("message", msg);

    // Store the message in the chat history
    socketapi.messages.push({ text: msg, timestamp: new Date() });
  });
});

module.exports = socketapi;