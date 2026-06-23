console.log("bridge-client.js loaded");

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

    cursor.style.left =
      event.data.x + "px";

    cursor.style.top =
      event.data.y + "px";

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

  if (
    event.data.type ===
    "MAPSYNC_PROJECT_POINT_RESULT"
  ) {
    const ping =
      activePings.find(
        (p) =>
          p.id ===
          event.data.pingId
      );

    if (!ping) return;

    ping.element.style.left =
      event.data.x + "px";

    ping.element.style.top =
      event.data.y + "px";

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