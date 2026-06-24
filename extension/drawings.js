console.log("drawings.js loaded");

// =================
// Drawing state
// =================

const drawings = [];

let isDrawing = false;
let currentDrawing = null;
let drawKeyDown = false;

// =================
// Drawing controls
// =================

document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "d") {
    drawKeyDown = true;
    updateStatus("drawing");
  }

  if (e.key === "Backspace" && !e.shiftKey) {
    socket.emit("delete-last-drawing");

    updateStatus("deleted");

    setTimeout(() => {
      updateStatus("connected");
    }, 1000);
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key.toLowerCase() === "d") {
    drawKeyDown = false;
    updateStatus("connected");

    if (isDrawing) {
      finishDrawing();
    }
  }
});

document.addEventListener("mousedown", (e) => {
  if (!drawKeyDown) return;

  e.preventDefault();
  e.stopPropagation();

  isDrawing = true;

  currentDrawing = {
    id: crypto.randomUUID(),
    points: [],
    color: confirmedColor || colorOptions[0]
  };

  drawings.push(currentDrawing);

  updateStatus("drawing");
});

document.addEventListener("mouseup", () => {
  if (isDrawing) {
    finishDrawing();
  }
});

function finishDrawing() {
  if (!currentDrawing) return;

  isDrawing = false;

console.log("finishing drawing:", currentDrawing);

if (currentDrawing.points.length > 1) {
  console.log("sending drawing-complete:", currentDrawing.points.length);

  socket.emit("drawing-complete", currentDrawing);
}

  currentDrawing = null;

  updateStatus("connected");
}

// =================
// Drawing socket events
// =================

socket.on("remote-drawing-complete", (drawing) => {
  console.log("remote drawing received:", drawing);  
  const remoteDrawing = {
    id: drawing.id,
    points: drawing.points,
    color: drawing.color
  };

  drawings.push(remoteDrawing);

  renderDrawing(remoteDrawing);
});

socket.on("drawing-history", (history) => {
  history.forEach((drawing) => {
    drawings.push(drawing);

    renderDrawing(drawing);
  });
});

socket.on(
  "remote-drawing-deleted",
  (drawingId) => {
    const index =
      drawings.findIndex(
        (d) =>
          d.id === drawingId
      );

    if (index === -1)
      return;

    drawings[
      index
    ].svgPath?.remove();

    drawings.splice(
      index,
      1
    );
  }
);

// =================
// Drawing rendering
// =================

function renderDrawing(drawing) {
  window.postMessage({
    type: "MAPSYNC_PROJECT_DRAWING",
    drawingId: drawing.id,
    points: drawing.points
  }, "*");
}

function updateAllDrawings() {
  drawings.forEach(renderDrawing);
}

setInterval(updateAllDrawings, 300);