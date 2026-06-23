console.log("pings.js loaded");

// =================
// Ping state
// =================

const activePings = [];

// =================
// Ping controls
// =================

document.addEventListener("click", (e) => {
  if (!e.altKey) return;

  e.preventDefault();
  e.stopPropagation();

  window.postMessage({
    type: "MAPSYNC_GET_MAP_POINT",
    requestId: crypto.randomUUID(),
    x: e.clientX,
    y: e.clientY
  }, "*");
});

// =================
// Socket
// =================

socket.on("remote-map-ping", (data) => {
  showPing(
    data.lng,
    data.lat,
    data.color
  );
});

// =================
// Ping rendering
// =================

function showPing(
  lng,
  lat,
  color = "hotpink"
) {
  const ping =
    document.createElement("div");

  ping.style.position =
    "fixed";

  ping.style.width =
    "40px";

  ping.style.height =
    "40px";

  ping.style.border =
    `4px solid ${color}`;

  ping.style.borderRadius =
    "50%";

  ping.style.background =
    "rgba(255,0,0,0.25)";

  ping.style.zIndex =
    "2147483647";

  ping.style.pointerEvents =
    "none";

  ping.style.transform =
    "translate(-50%, -50%)";

  document.body.appendChild(
    ping
  );

  const pingObj = {
    id: crypto.randomUUID(),
    element: ping,
    lng,
    lat,
    color
  };

  activePings.push(
    pingObj
  );

  updatePingPosition(
    pingObj
  );

  setTimeout(() => {
    ping.remove();

    const index =
      activePings.indexOf(
        pingObj
      );

    if (index !== -1) {
      activePings.splice(
        index,
        1
      );
    }
  }, 3000);
}

function updatePingPosition(
  ping
) {
  window.postMessage({
    type:
      "MAPSYNC_PROJECT_POINT",

    requestId:
      crypto.randomUUID(),

    pingId:
      ping.id,

    lng:
      ping.lng,

    lat:
      ping.lat,

    color:
      ping.color
  }, "*");
}

setInterval(() => {
  activePings.forEach(
    updatePingPosition
  );
}, 300);

