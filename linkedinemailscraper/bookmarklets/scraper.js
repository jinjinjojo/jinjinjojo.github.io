// Create the UI container (moveable window)
const scraperUI = document.createElement('div');
scraperUI.id = "scraperUI";
scraperUI.style.cssText = `
  position: fixed;
  top: 40px;
  right: 40px;
  width: 320px;
  background-color: #1F2937; /* Tailwind bg-gray-800 */
  color: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.3);
  cursor: move;
  z-index: 10000;
  font-family: sans-serif;
`;

// Insert the UI content
scraperUI.innerHTML = `
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
    <h2 style="font-size: 18px; font-weight: bold; color: white;">LinkedIn Scraper</h2>
    <button id="toggleScraper" style="
      background-color: #4B5563; /* Tailwind bg-gray-600 */
      padding: 8px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.3s;
      color: white;
    ">Start</button>
  </div>
  <h4 style="font-size: 14px; color: white; margin-bottom: 8px;">Made By George Ward</h4>
  <div id="statusMessage" style="font-size: 14px; margin-bottom: 8px;">Status: <span style="color: #F59E0B;">Stopped</span></div>
  <div id="copyCount" style="font-size: 14px;">Copies: <span style="color: #F59E0B;">0</span></div>
  <div id="copySuccess" style="color: #10B981; font-size: 14px; opacity: 0; transition: opacity 0.5s; margin-top: 8px;">Copy successful!</div>
`;

document.body.appendChild(scraperUI);

// Make the UI window moveable
dragElement(scraperUI);

// Function to handle dragging the window
function dragElement(el) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    el.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        el.style.top = (el.offsetTop - pos2) + "px";
        el.style.left = (el.offsetLeft - pos1) + "px";
    }
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Scraper control logic
let scraperInterval;
let copyCount = 0;
const statusMessage = document.getElementById("statusMessage");
const copySuccess = document.getElementById("copySuccess");
const copyCountDisplay = document.getElementById("copyCount");
const toggleButton = document.getElementById("toggleScraper");

// Toggle button logic
toggleButton.addEventListener('click', function () {
    if (scraperInterval) {
        clearInterval(scraperInterval);
        scraperInterval = null;
        statusMessage.innerHTML = 'Status: <span style="color: #F59E0B;">Stopped</span>';
        toggleButton.innerHTML = "Start";
        toggleButton.style.backgroundColor = "#4B5563"; // bg-gray-600
    } else {
        startScraper();
        statusMessage.innerHTML = 'Status: <span style="color: #10B981;">Running</span>';
        toggleButton.innerHTML = "Stop";
        toggleButton.style.backgroundColor = "#10B981"; // bg-green-600
    }
});

// Scraper function
function startScraper() {
    checkForButtonAndCopy();
}

// Show "Copy successful" message
function showCopySuccess() {
    copySuccess.style.opacity = "1"; // Make it visible
    setTimeout(() => {
        copySuccess.style.opacity = "0"; // Fade out after 1 second
    }, 1000);
}

// Function for clicking and copying
function simulateClickAndCopy() {
    const button = document.querySelector('.comments-comments-list__load-more-comments-button');
    if (button) {
        setTimeout(() => {
            button.click();
        }, 500); // Wait 500 ms before clicking
    }

    // Prepare the content to copy
    const prefix = "LinkedIn Scraper: ";
    const bodyContent = document.body.innerText; // Get the text content of the body
    const fullContent = prefix + bodyContent;

    // Copy using the navigator clipboard API
    navigator.clipboard.writeText(fullContent).then(() => {
        console.log("Text copied to clipboard");
    }).catch(err => {
        console.error("Failed to copy text: ", err);
    });
}

// Check for the "Load More Comments" button and simulate click when available
function checkForButtonAndCopy() {
    scraperInterval = setInterval(() => {
        const button = document.querySelector('.comments-comments-list__load-more-comments-button');
        if (button) {
            simulateClickAndCopy();
            copyCount++;
            copyCountDisplay.innerHTML = `Copies: <span style="color: #F59E0B;">${copyCount}</span>`;
            showCopySuccess();
        }
    }, 500); // Check every 500 ms
}
