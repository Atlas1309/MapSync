console.log("app.js loaded");

// =======================
// Connect to server
// =======================

const socket = io();

const connectionStatus = document.getElementById("connection-status");
const userCount = document.getElementById("user-count");

socket.on("connect", () => {
  connectionStatus.innerText = "Connected";
});

socket.on("disconnect", () => {
  connectionStatus.innerText = "Disconnected";
});

// =======================
// User identity
// =======================

const username = prompt("Enter your MapSync name:") || "Anonymous";

const myColor =
  "#" +
  Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0");

socket.emit("set-user-info", {
  name: username,
  color: myColor
});

// =======================
// Store remote cursors
// =======================

const cursors = {};

// =======================
// Send our mouse position
// =======================

document.addEventListener("mousemove", (e) => {
  socket.emit("mouse-move", {
    x: e.clientX,
    y: e.clientY
  });
});

// =======================
// Receive other users' cursor positions
// =======================

socket.on("remote-mouse-move", (data) => {
  console.log("remote mouse received:", data);

  let cursor = cursors[data.id];

  if (!cursor) {
    cursor = document.createElement("div");
    cursor.className = "cursor";
    cursor.style.background = data.color || "hotpink";
    cursor.style.zIndex = "10000";

    document.body.appendChild(cursor);
    cursors[data.id] = cursor;
  }

  cursor.style.left = data.x + "px";
  cursor.style.top = data.y + "px";
});

// =======================
// Remove disconnected users
// =======================

socket.on("user-left", (data) => {
  if (cursors[data.id]) {
    cursors[data.id].remove();
    delete cursors[data.id];
  }
});

socket.on("user-list", (users) => {
  console.log("user-list received:", users);

  userCount.innerText = users.length;

  const userList = document.getElementById("user-list");

  userList.innerHTML = "";

  users.forEach((user) => {
    const row = document.createElement("div");
    row.className = "user-row";

    const dot = document.createElement("div");
    dot.className = "user-dot";
    dot.style.background = user.color || "hotpink";

    const name = document.createElement("span");
    name.innerText = user.name || "Anonymous";

    row.appendChild(dot);
    row.appendChild(name);

    userList.appendChild(row);
  });
});