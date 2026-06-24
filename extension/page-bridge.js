console.log("MapSync page bridge loaded");

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (!event.data) return;

  const map = window.mapManager?.map;

  if (!map) return;

  // =========================
  // Screen → map conversions
  // =========================

  if (event.data.type === "MAPSYNC_GET_MAP_POINT") {
    const lngLat = map.unproject([
      event.data.x,
      event.data.y
    ]);

    window.postMessage({
      type: "MAPSYNC_MAP_POINT_RESULT",
      requestId: event.data.requestId,
      lng: lngLat.lng,
      lat: lngLat.lat,
      markerLabel: event.data.markerLabel
    }, "*");

    return;
  }

  if (event.data.type === "MAPSYNC_GET_CURSOR_POINT") {
    const lngLat = map.unproject([
      event.data.x,
      event.data.y
    ]);

    window.postMessage({
      type: "MAPSYNC_CURSOR_POINT_RESULT",
      requestId: event.data.requestId,
      lng: lngLat.lng,
      lat: lngLat.lat
    }, "*");

    return;
  }

  if (event.data.type === "MAPSYNC_GET_DRAW_POINT") {
    const lngLat = map.unproject([
      event.data.x,
      event.data.y
    ]);

    window.postMessage({
      type: "MAPSYNC_DRAW_POINT_RESULT",
      requestId: event.data.requestId,
      lng: lngLat.lng,
      lat: lngLat.lat
    }, "*");

    return;
  }

  // =========================
  // Map → screen conversions
  // =========================

  if (event.data.type === "MAPSYNC_PROJECT_POINT") {
    if (
      typeof event.data.lng !== "number" ||
      typeof event.data.lat !== "number"
    ) {
      console.warn("Invalid project request:", event.data);
      return;
    }

    const point = map.project([
      event.data.lng,
      event.data.lat
    ]);

    window.postMessage({
      type: "MAPSYNC_PROJECT_POINT_RESULT",
      requestId: event.data.requestId,
      pingId: event.data.pingId,
      x: point.x,
      y: point.y,
      lng: event.data.lng,
      lat: event.data.lat,
      color: event.data.color
    }, "*");

    return;
  }

  if (event.data.type === "MAPSYNC_PROJECT_CURSOR") {
    if (
      typeof event.data.lng !== "number" ||
      typeof event.data.lat !== "number"
    ) {
      console.warn("Invalid cursor project request:", event.data);
      return;
    }

    const point = map.project([
      event.data.lng,
      event.data.lat
    ]);

    window.postMessage({
      type: "MAPSYNC_PROJECT_CURSOR_RESULT",
      requestId: event.data.requestId,
      id: event.data.id,
      x: point.x,
      y: point.y
    }, "*");

    return;
  }

  if (event.data.type === "MAPSYNC_PROJECT_DRAWING") {
    if (!Array.isArray(event.data.points)) {
      console.warn("Invalid drawing project request:", event.data);
      return;
    }

    const projectedPoints = event.data.points
      .filter((point) =>
        typeof point.lng === "number" &&
        typeof point.lat === "number"
      )
      .map((point) => {
        const screenPoint = map.project([
          point.lng,
          point.lat
        ]);

        return {
          x: screenPoint.x,
          y: screenPoint.y
        };
      });

    window.postMessage({
      type: "MAPSYNC_PROJECT_DRAWING_RESULT",
      drawingId: event.data.drawingId,
      points: projectedPoints
    }, "*");

    return;
  }
});