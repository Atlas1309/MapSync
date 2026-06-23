// =================
// Inject page bridge
// =================

const bridgeScript = document.createElement("script");
bridgeScript.src = chrome.runtime.getURL("page-bridge.js");
bridgeScript.onload = () => bridgeScript.remove();
(document.head || document.documentElement).appendChild(bridgeScript);

console.log("MapSync extension loaded");

// =================
// SVG drawing layer
// =================

const svgOverlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");

svgOverlay.style.position = "fixed";
svgOverlay.style.left = "0";
svgOverlay.style.top = "0";
svgOverlay.style.width = "100vw";
svgOverlay.style.height = "100vh";
svgOverlay.style.zIndex = "2147483646";
svgOverlay.style.pointerEvents = "none";

document.body.appendChild(svgOverlay);

// =================
// Socket
// =================

const socket = io("http://localhost:3000");

// =================
// Identity
// =================

const colorOptions = [
  "#ff1744",
  "#00e676",
  "#2979ff",
  "#ffea00",
  "#ff9100",
  "#e040fb",
  "#00e5ff",
];

let confirmedColor = colorOptions[0];

let availableColourSet = new Set(colorOptions);

let colourButtons = [];

showLoginPanel();


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

// =================
// Bridge responses
// =================

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (!event.data) return;

  if (event.data.type === "MAPSYNC_CURSOR_POINT_RESULT") {
    socket.emit("mouse-move", {
      lng: event.data.lng,
      lat: event.data.lat
    });

    return;
  }

  if (event.data.type === "MAPSYNC_PROJECT_CURSOR_RESULT") {
    const cursor = cursors[event.data.id];

    if (!cursor) return;

    cursor.style.left = event.data.x + "px";
    cursor.style.top = event.data.y + "px";

    return;
  }

  if (event.data.type === "MAPSYNC_MAP_POINT_RESULT") {
    if (
      typeof event.data.lng === "number" &&
      typeof event.data.lat === "number"
    ) {
      socket.emit("map-ping", {
        lng: event.data.lng,
        lat: event.data.lat
      });
    }

    return;
  }

  if (event.data.type === "MAPSYNC_PROJECT_POINT_RESULT") {
    const ping = activePings.find(
      (p) => p.id === event.data.pingId
    );

    if (!ping) return;

    ping.element.style.left = event.data.x + "px";
    ping.element.style.top = event.data.y + "px";

    return;
  }

  if (event.data.type === "MAPSYNC_DRAW_POINT_RESULT") {
    console.log("draw point result", event.data);

    if (!isDrawing || !currentDrawing) return;

    currentDrawing.points.push({
      lng: event.data.lng,
      lat: event.data.lat
    });

    renderDrawing(currentDrawing);

    return;
  }

  if (event.data.type === "MAPSYNC_PROJECT_DRAWING_RESULT") {
    const drawing = drawings.find(
      (d) => d.id === event.data.drawingId
    );

    if (!drawing) return;

    if (!drawing.svgPath) {
      drawing.svgPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polyline"
      );

      drawing.svgPath.setAttribute("fill", "none");
      drawing.svgPath.setAttribute("stroke", drawing.color || "hotpink");
      drawing.svgPath.setAttribute("stroke-width", "6");
      drawing.svgPath.setAttribute("stroke-linecap", "round");
      drawing.svgPath.setAttribute("stroke-linejoin", "round");

      svgOverlay.appendChild(drawing.svgPath);
    }

    const screenPoints = event.data.points
      .map((point) => `${point.x},${point.y}`)
      .join(" ");

    drawing.svgPath.setAttribute("points", screenPoints);

    return;
  }
});