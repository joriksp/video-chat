const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { ExpressPeerServer } = require("peer");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = createServer(app);
const io = new Server(server, {
   cors: {
      origin: "*",
   },
});

const options = {
   debug: true,
};

app.use("/peerjs", ExpressPeerServer(server, options));
app.use(express.static("public"));

app.get("/", (req, res) => {
   res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
   res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
   socket.on("join-room", (roomId, userId, userName) => {
      socket.join(roomId);
      setTimeout(() => {
         socket.to(roomId).broadcast.emit("user-connected", userId);
      }, 1000);

      socket.on("message", (message) => {
         io.to(roomId).emit("createMessage", message, userName);
      });
   });
});

server.listen(3000, () => {
   console.log("Server is running on port 3000");
});
