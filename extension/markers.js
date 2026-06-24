console.log("markers.js loaded");

// =================
// Marker state
// =================

var markers = [];

// =================
// Create marker
// =================

document.addEventListener("click", (e) => {
  if (!e.shiftKey) return;

  e.preventDefault();
  e.stopPropagation();

  const label =
    prompt("Marker name");

  if (!label) return;

  window.postMessage({
    type: "MAPSYNC_GET_MAP_POINT",
    requestId:
      crypto.randomUUID(),

    x:
      e.clientX,

    y:
      e.clientY,

    markerLabel:
      label
  }, "*");
});

// =================
// Socket
// =================

socket.on(
  "remote-marker-created",
  (marker) => {
    createMarker(marker);
  }
);

socket.on("remote-marker-deleted", (markerId) => {
  const index = markers.findIndex(
    (m) => m.id === markerId
  );

  if (index === -1) return;

  markers[index].element?.remove();

  markers.splice(index, 1);

  updateStatus(
    "marker deleted"
  );

  setTimeout(() => {
    updateStatus(
      "connected"
    );
  }, 1000);
});

socket.on(
  "marker-history",
  (history) => {
    history.forEach(
      createMarker
    );
  }
);

// =================
// Render marker
// =================

function createMarker(
  marker
) {
  const element =
    document.createElement(
      "div"
    );

  element.style.position =
    "fixed";

  element.style.zIndex =
    "2147483647";

  element.style.pointerEvents =
    "none";

  element.style.transform =
    "translate(-50%, -100%)";

  element.innerHTML = `
<div style="
  display:flex;
  flex-direction:column;
  align-items:center;
">

  <div class="mapsync-marker-label" style="
    background:${marker.color};
    color:white;

    padding:4px 8px;

    border-radius:8px;

    margin-bottom:4px;

    opacity:0;

    transform:translateY(5px);

    transition:
      opacity 0.15s,
      transform 0.15s;

    white-space:nowrap;

    pointer-events:none;

    border:2px solid white;

    box-shadow:
      0 2px 6px rgba(0,0,0,0.4);
  ">
    ${marker.label}
  </div>

  <div style="
    width:18px;

    height:18px;

    background:${marker.color};

    border:2px solid white;

    border-radius:
      50%
      50%
      50%
      0;

    transform:
      rotate(-45deg);

    box-shadow:
      0 2px 6px rgba(0,0,0,0.5);
  ">
    <div style="
      width:6px;

      height:6px;

      background:white;

      border-radius:50%;

      margin:4px;
    ">
    </div>

  </div>
</div>
`;

const label =
  element.querySelector(
    ".mapsync-marker-label"
  );

element.style.pointerEvents =
  "auto";

element.addEventListener(
  "mouseenter",
  () => {
    label.style.opacity = "1";

    label.style.transform =
      "translateY(0)";
  }
);

element.addEventListener(
  "mouseleave",
  () => {
    label.style.opacity = "0";

    label.style.transform =
      "translateY(5px)";
  }
);

  document.body.appendChild(
    element
  );

  marker.element =
    element;

  markers.push(
    marker
  );

  updateMarkerPosition(
    marker
  );
}

function updateMarkerPosition(
  marker
) {
  window.postMessage({
    type:
      "MAPSYNC_PROJECT_POINT",

    requestId:
      crypto.randomUUID(),

    pingId:
      marker.id,

    lng:
      marker.lng,

    lat:
      marker.lat,

    color:
      marker.color
  }, "*");
}

setInterval(() => {
  markers.forEach(
    updateMarkerPosition
  );
}, 300);

document.addEventListener("keydown", (e) => {
  if (e.key !== "Backspace" || !e.shiftKey) return;

  const marker = [...markers]
  .reverse()
  .find((m) => m.ownerId === socket.id);

  console.log("requesting marker delete:", marker);

  if (!marker) {
    updateStatus("no markers to delete");
    return;
  }

  socket.emit("marker-deleted", marker.id);
});

  
