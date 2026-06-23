console.log("socket.js loaded");

var socket =
  io("http://localhost:3000");

  socket.on("user-info-confirmed", (user) => {
  confirmedColor = user.color || colorOptions[0];
});

// =================
// Connection
// =================

socket.on("connect", () => {
  updateStatus("connected");
});

socket.on("disconnect", () => {
  updateStatus("disconnected");
});

socket.on("available-colors", (colors) => {
  availableColourSet = new Set(colors);
  updateColourButtons();
});
