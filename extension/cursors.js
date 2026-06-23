console.log("cursors.js loaded");

// =================
// Cursor state
// =================

const cursors = {};

let lastCursorSend = 0;

// =================
// Cursor movement
// =================

document.addEventListener("mousemove", (e) => {
  const now = Date.now();

  if (now - lastCursorSend >= 40) {
    lastCursorSend = now;

    window.postMessage({
      type: "MAPSYNC_GET_CURSOR_POINT",
      requestId: crypto.randomUUID(),
      x: e.clientX,
      y: e.clientY
    }, "*");
  }
  if (isDrawing && currentDrawing) {
  window.postMessage({
    type: "MAPSYNC_GET_DRAW_POINT",
    requestId: crypto.randomUUID(),
    x: e.clientX,
    y: e.clientY
  }, "*");
}
});

socket.on("remote-mouse-move", (data) => {
  if (
    typeof data.lng !== "number" ||
    typeof data.lat !== "number"
  ) {
    console.warn("Ignoring bad remote cursor:", data);
    return;
  }

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

  cursor.style.background = data.color || "hotpink";

  window.postMessage({
    type: "MAPSYNC_PROJECT_CURSOR",
    requestId: crypto.randomUUID(),
    id: data.id,
    lng: data.lng,
    lat: data.lat
  }, "*");
});

socket.on("user-left", (data) => {
  if (cursors[data.id]) {
    cursors[data.id].remove();
    delete cursors[data.id];
  }
});