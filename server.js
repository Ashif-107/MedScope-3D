const viewer = document.getElementById("viewer");

const scanButton = document.getElementById("scan-button");
const fileInput = document.getElementById("file-input");
const cameraPreview = document.getElementById("camera-preview");
const photoCanvas = document.getElementById("photo-canvas");
const ctx = photoCanvas.getContext('2d');


// Camera stream reference
let cameraStream = null;

// Scan button click handler
scanButton.addEventListener('click', async () => {
    try {
        // Start camera capture
        await startCamera();
        
        // Take photo after 2 seconds (adjust as needed)
        setTimeout(captureAndSendPhoto, 2000);
    } catch (error) {
        console.error("Error accessing camera:", error);
        alert("Could not access camera. Please ensure permissions are granted.");
    }
});

// Start camera function
async function startCamera() {
    if (cameraStream) {
        return; // Camera already running
    }
    
    cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: 'environment', // Use rear camera
            width: { ideal: 1280 },
            height: { ideal: 720 }
        },
        audio: false
    });
    
    cameraPreview.srcObject = cameraStream;
    cameraPreview.style.display = 'block';
    cameraPreview.play();
}

// Capture photo and send to API
function captureAndSendPhoto() {
    // Set canvas dimensions to match camera
    photoCanvas.width = cameraPreview.videoWidth;
    photoCanvas.height = cameraPreview.videoHeight;
    
    // Draw current frame to canvas
    ctx.drawImage(cameraPreview, 0, 0, photoCanvas.width, photoCanvas.height);
    
    // Stop camera
    stopCamera();
    
    // Convert to blob and send
    photoCanvas.toBlob(async (blob) => {
        try {
            await sendScanToAPI(blob);
        } catch (error) {
            console.error("Error sending scan:", error);
            alert("Scan upload failed. Please try again.");
        }
    }, 'image/jpeg', 0.9);
}

// Stop camera function
function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
        cameraPreview.style.display = 'none';
    }
}

// Send scan to API
async function sendScanToAPI(imageBlob) {
    const formData = new FormData();
    formData.append('scan', imageBlob, 'scan_' + Date.now() + '.jpg');
    formData.append('metadata', JSON.stringify({
        timestamp: new Date().toISOString(),
        device: navigator.userAgent
    }));
    
    
    try {
        const response = await fetch('https://87a4-2401-4900-627f-65c9-e857-9b28-e3a0-7c42.ngrok-free.app/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }


        const result = await response.json();
        console.log("Scan result:", result);

        if (result.modelUrl) {
            const viewer = document.getElementById('viewer');
            viewer.src = result.modelUrl;
        }
    } catch (error) {
        console.error("Failed to send image:", error);
    }
    
}

const modelSelector = document.getElementById('model-selector');

// Model switching functionality
modelSelector.addEventListener('change', (event) => {
    const selectedModel = event.target.value;
    viewer.src = selectedModel;
    
    // Optional: Reset camera position when changing models
    viewer.cameraOrbit = '0deg 75deg 105%';
});

// Optional: Preload models for better performance
function preloadModels() {
    const models = [
        'models/brain.glb',
        'models/realistic_human_heart.glb',
        'models/kidney.glb',
        'models/kidneycut.glb',
    ];
    
    models.forEach(model => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'fetch';
        link.href = model;
        document.head.appendChild(link);
    });
}

// Change model when selection changes
function setupModelSelector() {
    const selector = document.getElementById('model-selector');
    const viewer = document.getElementById('viewer');
    const cutKidneyBtn = document.getElementById('cut-kidney-btn');
    const kidneyCutOption = document.getElementById('kidney-cut-option');
    
    selector.addEventListener('change', (event) => {
        viewer.src = event.target.value;
        
        // Show/hide the "Cut Kidney" button based on selection
        if (event.target.value === 'models/kidney.glb') {
            cutKidneyBtn.style.display = 'block';
            kidneyCutOption.style.display = 'block'; // Show the cut option in dropdown
        } else {
            cutKidneyBtn.style.display = 'none';
            kidneyCutOption.style.display = 'none'; // Hide the cut option for other models
        }
    });
    
    // Handle the "Cut Kidney" button click
    cutKidneyBtn.addEventListener('click', () => {
        viewer.src = 'models/kidneycut.glb';
        cutKidneyBtn.style.display = 'none'; // Hide after cutting
        selector.value = 'models/kidneycut.glb'; // Update dropdown
    });
    
    // Initialize visibility
    cutKidneyBtn.style.display = 'none';
    kidneyCutOption.style.display = 'none';
}

// Initialize everything when page loads
window.addEventListener('load', () => {
    preloadModels();
    setupModelSelector();
    
    // Add any other initialization code here
    const scanButton = document.getElementById('scan-button');
    if (scanButton) {
        scanButton.addEventListener('click', () => {
            // Add your scan functionality here
            document.getElementById('file-input').click();
        });
    }
});

// Call this when your page loads
window.addEventListener('load', preloadModels);



let pitch = 0; // X-axis
let yaw = 0;   // Y-axis
let roll = 0;  // Z-axis

const updateRotation = () => {
  viewer.orientation = `${pitch}deg ${yaw}deg ${roll}deg`;
};

document.addEventListener("keydown", (e) => {
  const step = 5;

  switch (e.key.toLowerCase()) {
    case "w":
      yaw -= step;
      break;
    case "s":
      yaw += step;
      break;
    case "a":
      roll -= step;
      break;
    case "d":
      roll += step;
      break;
  }

  updateRotation();
});