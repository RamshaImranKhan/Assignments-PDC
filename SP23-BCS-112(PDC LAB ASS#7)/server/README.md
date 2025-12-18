# GPU-Accelerated AI Camera Backend Server

Backend server for the GPU-Accelerated AI Camera App, demonstrating **Parallel and Distributed Computing (PDC)** concepts.

## Features

- **REST API** for image processing
- **WebSocket** for real-time frame streaming
- **CUDA Support** (when configured with GPU)
- **OpenCV Integration** (when configured)
- **Distributed Processing** (client-server architecture)

## Installation

```bash
cd server
npm install
```

## Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on:
- **REST API**: http://localhost:3000
- **WebSocket**: ws://localhost:3001

## API Endpoints

### Health Check
```
GET /api/health
```

### Process Image
```
POST /api/detect
Content-Type: multipart/form-data
Body: image file
```

### Server Info
```
GET /api/info
```

## WebSocket Connection

Connect to `ws://localhost:3001` for real-time frame processing:

```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  // Send frame data
  ws.send(JSON.stringify({
    type: 'frame',
    frame: base64ImageData
  }));
};

ws.onmessage = (event) => {
  const result = JSON.parse(event.data);
  // Handle detections
};
```

## Adding CUDA/OpenCV Support

### For CUDA (Python Backend Alternative)

If you want to use CUDA, consider a Python backend:

```python
# server_python/app.py
from flask import Flask, request, jsonify
import cv2
import numpy as np
# Add CUDA-enabled TensorFlow or PyTorch here

app = Flask(__name__)

@app.route('/api/detect', methods=['POST'])
def detect():
    # Process with CUDA
    pass
```

### For OpenCV Native

Install OpenCV for Node.js:
```bash
npm install opencv4nodejs
```

## Integration with Frontend

Update your React Native app to use the backend:

```javascript
// In App.js
const processWithBackend = async (imageData) => {
  const response = await fetch('http://localhost:3000/api/detect', {
    method: 'POST',
    body: formData // with image
  });
  return await response.json();
};
```

## PDC Concepts Demonstrated

1. **Distributed Computing**: Client (browser) + Server (Node.js)
2. **Parallel Processing**: Multiple requests processed concurrently
3. **GPU Acceleration**: CUDA support for heavy computations
4. **Load Balancing**: Can scale with multiple server instances


