console.log("Starting MapSync server...");

const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
app.use(express.static(path.join(__dirname, "../client")));

// Serve test page
//app.get("/", (req, res) => {
//  const filePath = path.join(__dirname, "../client/index.html");
//  console.log("Serving:", filePath);
//  res.sendFile(filePath);
//});

app.get("/", (req, res) => {
  res.send("MapSync server online");
});

// Store connected users (for later)
let users = {};

let savedDrawings = [];

let savedMarkers = [];

const availableColors = [
  "#ff1744", // red
  "#00e676", // green
  "#2979ff", // blue
  "#ffea00", // yellow
  "#ff9100", // orange
  "#e040fb", // purple
  "#00e5ff", // cyan
];
function getUsedColors() {
  return Object.values(users)
    .map((user) => user.color)
    .filter(Boolean);
}
function broadcastUserList() {
  io.emit("user-list", Object.values(users));
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Save temporary user
  users[socket.id] = {
    id: socket.id
  };

  io.emit("user-joined", {
    id: socket.id,
    totalUsers: Object.keys(users).length
  });

  socket.emit("welcome", {
    message: "Welcome to MapSync!"
  });
  socket.emit("drawing-history", savedDrawings);

  // NEW
  socket.emit(
  "marker-history", savedMarkers
);

  // NEW
  socket.emit(
  "available-colors",
  availableColors.filter(
    (c) => !getUsedColors().includes(c)
  )
  );

  // Save username + colour
  socket.on("set-user-info", (data) => {
    const usedColors = getUsedColors();

    let requestedColor = data.color;

    if (
      !availableColors.includes(requestedColor) ||
      usedColors.includes(requestedColor)
    ) {
      requestedColor =
        availableColors.find(
          (color) => !usedColors.includes(color)
        ) || "hotpink";
    }

    users[socket.id] = {
      id: socket.id,
      name: data.name,
      color: requestedColor
    };

    socket.emit("user-info-confirmed", users[socket.id]);

    broadcastUserList();

    // NEW
    io.emit(
      "available-colors",
      availableColors.filter(
        (c) => !getUsedColors().includes(c)
      )
    );

    console.log("User info updated:", users[socket.id]);
  });

  socket.on("marker-created", (marker) => {
  const savedMarker = {
    ...marker,
    ownerId: socket.id
  };

  savedMarkers.push(savedMarker);

  io.emit(
    "remote-marker-created",
    savedMarker
  );
});

  socket.on("marker-deleted", (markerId) => {
  console.log("marker delete requested:", markerId);

  const marker = savedMarkers.find(
    (m) => m.id === markerId
  );

  console.log("marker found:", marker);

  if (!marker || marker.ownerId !== socket.id) {
    console.log("marker delete rejected");
    return;
  }

  savedMarkers = savedMarkers.filter(
    (m) => m.id !== markerId
  );

  io.emit("remote-marker-deleted", markerId);
});

  // Mouse movement
  socket.on("mouse-move", (data) => {
    if (
      typeof data.lng !== "number" ||
      typeof data.lat !== "number"
    ) {
      console.warn("Ignoring bad mouse-move:", data);
      return;
    }

    socket.broadcast.emit("remote-mouse-move", {
      id: socket.id,
      lng: data.lng,
      lat: data.lat,
      name: users[socket.id]?.name || "Anonymous",
      color: users[socket.id]?.color || "lime"
    });
  });

  // Map ping
  socket.on("map-ping", (data) => {
    socket.broadcast.emit("remote-map-ping", {
      id: socket.id,
      lng: data.lng,
      lat: data.lat,
      name: users[socket.id]?.name || "Anonymous",
      color: users[socket.id]?.color || "hotpink"
    });
  });

// Drawing complete
socket.on("drawing-complete", (drawing) => {
  console.log(
    "drawing-complete received:",
    drawing.points?.length
  );

  savedDrawings.push({
  id: drawing.id,
  points: drawing.points,
  color: users[socket.id]?.color,
  ownerId: socket.id
});

  socket.broadcast.emit(
    "remote-drawing-complete",
    savedDrawings[
      savedDrawings.length - 1
    ]
  );
});

  // Delete last drawing
  socket.on("delete-last-drawing", () => {
  const index = savedDrawings
    .map((drawing, index) => ({ drawing, index }))
    .reverse()
    .find(({ drawing }) => drawing.ownerId === socket.id)
    ?.index;

  if (index === undefined) return;

  const [deleted] = savedDrawings.splice(index, 1);

  io.emit("remote-drawing-deleted", deleted.id);
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