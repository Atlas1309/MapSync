console.log("socket.js loaded");

var socket =
  io("https://mapsync.cloweshub.uk");

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
