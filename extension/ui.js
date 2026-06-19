// =================
// Overlay panel
// =================

const panel = document.createElement("div");

function updateStatus(text = "connected") {
  panel.innerHTML = `
    <div style="font-weight:bold;margin-bottom:6px;">
      MapSync ${text}
    </div>

    <div>D + Middle Mouse → Draw</div>
    <div>Backspace → Delete last</div>
    <div>Alt + Click → Ping</div>
  `;
}

updateStatus("connecting...");
panel.style.position = "fixed";
panel.style.bottom = "10px";
panel.style.right = "10px";
panel.style.zIndex = "999999";
panel.style.background = "white";
panel.style.color = "black";
panel.style.padding = "10px";
panel.style.borderRadius = "10px";
panel.style.fontFamily = "Arial, sans-serif";
panel.style.fontSize = "13px";

document.body.appendChild(panel);

//

function showLoginPanel() {
  const loginPanel = document.createElement("div");

  loginPanel.style.position = "fixed";
  loginPanel.style.top = "50%";
  loginPanel.style.left = "50%";
  loginPanel.style.transform = "translate(-50%, -50%)";
  loginPanel.style.zIndex = "2147483647";
  loginPanel.style.background = "white";
  loginPanel.style.color = "black";
  loginPanel.style.padding = "16px";
  loginPanel.style.borderRadius = "12px";
  loginPanel.style.fontFamily = "Arial, sans-serif";
  loginPanel.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";

  loginPanel.innerHTML = `
    <div style="font-weight:bold;margin-bottom:10px;">
      Join MapSync
    </div>

    <div style="color:black;margin-bottom:4px;">
      Your name
    </div>

    <input id="mapsync-name" style="
      width: 180px;
      padding: 6px;
      margin-bottom: 10px;
      color: black;
      background: white;
      border: 1px solid #797878;
    ">

    <div style="margin-bottom:8px;">
      Pick a colour:
    </div>

    <div id="mapsync-colours" style="
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    "></div>

    <button id="mapsync-join">
      Join
    </button>
  `;

  document.body.appendChild(loginPanel);

  const placeholderStyle =
  document.createElement("style");

  placeholderStyle.textContent = `
  #mapsync-name::placeholder {
    color: #525252;
    opacity: 1;
  }
`;

document.head.appendChild(
  placeholderStyle
);

let selectedColor = colorOptions[0];

const colourContainer =
  loginPanel.querySelector("#mapsync-colours");

colorOptions.forEach((color) => {
  const button = document.createElement("button");

  button.type = "button";
  button.style.width = "24px";
  button.style.height = "24px";
  button.style.borderRadius = "50%";
  button.style.border = "2px solid #333";
  button.style.background = color;
  button.style.cursor = "pointer";

  button.addEventListener("click", () => {
    selectedColor = color;

    [...colourContainer.children].forEach((child) => {
      child.style.outline = "none";
    });

    button.style.outline = "3px solid black";
  });

  colourContainer.appendChild(button);

  colourButtons.push({
    color,
    button
  });
});

colourContainer.children[0].style.outline =
  "3px solid black";

updateColourButtons();

loginPanel
  .querySelector("#mapsync-join")
  .addEventListener("click", () => {
    const nameInput =
      loginPanel.querySelector("#mapsync-name");

    const username =
      nameInput.value.trim() || "Anonymous";

    socket.emit("set-user-info", {
      name: username,
      color: selectedColor
    });

    loginPanel.remove();
  });
}

//

function updateColourButtons() {
  colourButtons.forEach(({ color, button }) => {
    const isAvailable = availableColourSet.has(color);

    button.disabled = !isAvailable;
    button.style.opacity = isAvailable ? "1" : "0.25";
    button.style.cursor = isAvailable ? "pointer" : "not-allowed";
  });
}