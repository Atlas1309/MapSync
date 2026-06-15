console.log("Starting MapSync server...");

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve test page
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>MapSync</title>
  <style>
    body {
      margin: 0;
      height: 100vh;
      background: #111;
      overflow: hidden;
      cursor: default;
    }

    .cursor {
      position: absolute;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: lime;
      pointer-events: none;
    }
  </style>
</head>

<body>
    <div style="
        position: fixed;
        top: 10px;
        left: 10px;
        color: white;
        font-family: Arial;
        font-size: 14px;
        opacity: 0.7;
        z-index: 9999;
">
  MapSync • Live Collaboration Active
</div>
<script src="/socket.io/socket.io.js"></script>

<script>
const socket = io();

// store other users' cursors
const cursors = {};

// SEND mouse position
document.addEventListener("mousemove", (e) => {
  socket.emit("mouse-move", {
    x: e.clientX,
    y: e.clientY
  });
});

// RECEIVE mouse positions
socket.on("remote-mouse-move", (data) => {
  let cursor = cursors[data.id];

  if (!cursor) {
    cursor = document.createElement("div");
    cursor.className = "cursor";
    document.body.appendChild(cursor);
    cursors[data.id] = cursor;
  }

  cursor.style.left = data.x + "px";
  cursor.style.top = data.y + "px";
});
</script>

</body>
</html>
  `);
});

// Store connected users (for later)
let users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Save user
  users[socket.id] = {
    id: socket.id
  };

  // Tell everyone a new user joined
  io.emit("user-joined", {
    id: socket.id,
    totalUsers: Object.keys(users).length
  });

  // Send welcome message to just this user
  socket.emit("welcome", {
    message: "Welcome to MapSync!"
  });

    // 👇 ADD IT HERE (IMPORTANT)
  socket.on("mouse-move", (data) => {
    socket.broadcast.emit("remote-mouse-move", {
      id: socket.id,
      x: data.x,
      y: data.y
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    delete users[socket.id];

    io.emit("user-left", {
      id: socket.id,
      totalUsers: Object.keys(users).length
    });
  });
});

// Start server
server.listen(3000, () => {
  console.log("MapSync running on http://localhost:3000");
});