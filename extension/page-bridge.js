console.log("MapSync page bridge loaded");

window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  const map = window.mapManager?.map;

  if (!map) return;

  // Convert screen → map coords
  if (event.data?.type === "MAPSYNC_GET_MAP_POINT") {
    const lngLat = map.unproject([
      event.data.x,
      event.data.y
    ]);

    window.postMessage({
      type: "MAPSYNC_MAP_POINT_RESULT",
      requestId: event.data.requestId,
      lng: lngLat.lng,
      lat: lngLat.lat
    }, "*");

    return;
  }

  // Convert map → screen coords
  if (event.data?.type === "MAPSYNC_PROJECT_POINT") {
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
});