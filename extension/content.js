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



// =================
// Bridge responses
// =================

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (!event.data) return;


});