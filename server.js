const express = require("express");
const path = require("path");
const fs = require("fs").promises
const PORT = process.env.PORT || 5000;
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname , "/public")));

io.on("connection", function (socket) {
  socket.on("newuser", function (username) {
    socket.broadcast.emit("update", username + " joined the conversation");
  });

  socket.on("exituser", function (username) {
    socket.broadcast.emit("update", username + " left the conversation");
  });

  socket.on("chat", function (message) {
    socket.broadcast.emit("chat", message);
  });

  socket.on("image", async (image) => {
    const { username, base64 } = image;
    const buffer = Buffer.from(base64, "base64");

    const dir = path.join(__dirname, "tmp");
    const filename = path.join(dir, `image-${Date.now()}-${username}.png`);

    try {
      await fs.mkdir(dir, { recursive: true }); // ensures folder exists
      await fs.writeFile(filename, buffer);
      socket.broadcast.emit("image", { username, base64 });
    } catch (err) {
      console.error("Error saving image:", err);
    }
  });
});


server.listen(PORT);


