console.log("Starting MapSync server...");

const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static(path.join(__dirname, "../client")));

// Serve test page
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "../client/index.html");
  console.log("Serving:", filePath);
  res.sendFile(filePath);
});
// Store connected users (for later)
let users = {};

function broadcastUserList() {
  io.emit("user-list", Object.values(users));
}

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

  // Save username + colour
  socket.on("set-user-info", (data) => {
    users[socket.id] = {
      id: socket.id,
      name: data.name,
      color: data.color
  };
  
  broadcastUserList();

  console.log("User info updated:", users[socket.id]);
});

    // 👇 ADD IT HERE (IMPORTANT)
  socket.on("mouse-move", (data) => {
    socket.broadcast.emit("remote-mouse-move", {
      id: socket.id,
      x: data.x,
      y: data.y,    
      name: users[socket.id]?.name || "Anonymous",
      color: users[socket.id]?.color || "lime"
    });
  });


  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    delete users[socket.id];

    broadcastUserList();

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