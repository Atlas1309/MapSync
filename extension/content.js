const bridgeScript = document.createElement("script");
bridgeScript.src = chrome.runtime.getURL("page-bridge.js");
bridgeScript.onload = () => bridgeScript.remove();
(document.head || document.documentElement).appendChild(bridgeScript);

console.log("MapSync extension loaded");

// =================
// Overlay panel
// =================

const panel = document.createElement("div");

panel.innerText = "MapSync connecting...";

panel.style.position = "fixed";

panel.style.bottom = "10px";

panel.style.right = "10px";

panel.style.zIndex = "999999";

panel.style.background = "white";

panel.style.padding = "10px";

panel.style.borderRadius = "10px";

document.body.appendChild(panel);

// =================
// Socket
// =================

const socket = io("http://localhost:3000");

// =================
// Identity
// =================

const username =
  prompt("Enter your MapSync name") || "Anonymous";

const myColor =
  "#" +
  Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0");

socket.emit("set-user-info", {
  name: username,
  color: myColor
});

// =================
// Connection
// =================

socket.on("connect", () => {
  panel.innerText = "MapSync connected";
});

// =================
// Cursor storage
// =================

const cursors = {};


const activePings = [];

// =================
// Send movement
// =================

document.addEventListener("mousemove", (e) => {
  console.log("extension mousemove", e.clientX, e.clientY);

  socket.emit("mouse-move", {
    x: e.clientX,
    y: e.clientY
  });
});
// =================
// Receive movement
// =================

socket.on("remote-mouse-move", (data) => {
  console.log("remote cursor:", data);

  let cursor = cursors[data.id];

  if (!cursor) {
    cursor = document.createElement("div");

    cursor.style.position = "fixed";
    cursor.style.width = "30px";
    cursor.style.height = "30px";

    cursor.style.borderRadius = "50%";

    cursor.style.pointerEvents = "none";

    cursor.style.zIndex = "2147483647";

    document.body.appendChild(cursor);

    cursors[data.id] = cursor;
  }

  cursor.style.background =
    data.color || "hotpink";

  cursor.style.left =
    data.x + "px";

  cursor.style.top =
    data.y + "px";
});

// =================
// Cleanup
// =================

socket.on("user-left", (data) => {
  if (cursors[data.id]) {
    cursors[data.id].remove();

    delete cursors[data.id];
  }
});

document.addEventListener("click", (e) => {
  if (!e.altKey) return;

  e.preventDefault();
  e.stopPropagation();

  console.log("Alt-click detected:", e.clientX, e.clientY);

  window.postMessage({
    type: "MAPSYNC_GET_MAP_POINT",
    requestId: crypto.randomUUID(),
    x: e.clientX,
    y: e.clientY
  }, "*");
});

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (!event.data) return;

  // Result from Alt-click: screen position -> map coordinates
  if (event.data.type === "MAPSYNC_MAP_POINT_RESULT") {
    console.log("Map point result:", event.data);

    if (event.data.lng !== undefined && event.data.lat !== undefined) {
      socket.emit("map-ping", {
        lng: event.data.lng,
        lat: event.data.lat
      });
    }

    return;
  }

  // Result from remote ping: map coordinates -> screen position
if (event.data.type === "MAPSYNC_PROJECT_POINT_RESULT") {
  const ping = activePings.find(
    (p) => p.id === event.data.pingId
  );

  if (!ping) return;

  ping.element.style.left =
    event.data.x + "px";

  ping.element.style.top =
    event.data.y + "px";

  return;
}

    setTimeout(() => ping.remove(), 3000);

    return;
  }
);

function showPing(lng, lat, color = "hotpink") {
  const ping = document.createElement("div");

  ping.style.position = "fixed";
  ping.style.width = "40px";
  ping.style.height = "40px";
  ping.style.border = `4px solid ${color}`;
  ping.style.borderRadius = "50%";
  ping.style.background = "rgba(255,0,0,0.25)";
  ping.style.zIndex = "2147483647";
  ping.style.pointerEvents = "none";
  ping.style.transform = "translate(-50%, -50%)";

  document.body.appendChild(ping);

  const pingObj = {
    id: crypto.randomUUID(),
    element: ping,
    lng,
    lat,
    color
  };

  activePings.push(pingObj);

  updatePingPosition(pingObj);

  setTimeout(() => {
    ping.remove();

    const index = activePings.indexOf(pingObj);

    if (index !== -1) {
      activePings.splice(index, 1);
    }
  }, 3000);
}

function updatePingPosition(ping) {
  window.postMessage({
    type: "MAPSYNC_PROJECT_POINT",
    requestId: crypto.randomUUID(),
    pingId: ping.id,
    lng: ping.lng,
    lat: ping.lat,
    color: ping.color
  }, "*");
}
// setInterval(updatePings, 100);

socket.on("remote-map-ping", (data) => {
  console.log("remote-map-ping received:", data);
  showPing(data.lng, data.lat, data.color);
});

setInterval(() => {
   activePings.forEach(updatePingPosition);
}, 300);