const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// WebSocket server for real-time processing
const wss = new WebSocket.Server({ port: 3001 });

wss.on('connection', (ws) => {
  console.log('Client connected via WebSocket');
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'frame') {
        // Process frame (in real implementation, use TensorFlow/CUDA here)
        const result = await processFrame(data.frame);
        ws.send(JSON.stringify({
          type: 'detection',
          detections: result.detections,
          processingTime: result.processingTime
        }));
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Process frame (placeholder - replace with actual ML model)
async function processFrame(frameData) {
  const startTime = Date.now();
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // In real implementation:
  // 1. Decode base64 image
  // 2. Run TensorFlow/CUDA model
  // 3. Return detections
  
  const processingTime = Date.now() - startTime;
  
  return {
    detections: [
      // Placeholder detections
      { label: 'Object', confidence: 0.85, x: 100, y: 100, width: 200, height: 200 }
    ],
    processingTime
  };
}

// REST API endpoints

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'GPU Camera Backend Server',
    timestamp: new Date().toISOString()
  });
});

// Process single image
app.post('/api/detect', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const startTime = Date.now();
    
    // Process image with Sharp (for image manipulation)
    const imageBuffer = req.file.buffer;
    const metadata = await sharp(imageBuffer).metadata();
    
    // TODO: Add actual ML model inference here
    // Example: const detections = await model.detect(imageBuffer);
    
    const processingTime = Date.now() - startTime;
    
    res.json({
      success: true,
      detections: [
        // Placeholder - replace with actual model predictions
        { label: 'Object', confidence: 0.85, bbox: [100, 100, 200, 200] }
      ],
      processingTime,
      imageSize: { width: metadata.width, height: metadata.height }
    });
  } catch (error) {
    console.error('Detection error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get server info
app.get('/api/info', (req, res) => {
  res.json({
    server: 'GPU-Accelerated AI Camera Backend',
    version: '1.0.0',
    features: [
      'REST API for image processing',
      'WebSocket for real-time frame processing',
      'CUDA support (when configured)',
      'OpenCV integration (when configured)'
    ],
    endpoints: {
      health: '/api/health',
      detect: '/api/detect (POST)',
      info: '/api/info',
      websocket: 'ws://localhost:3001'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 GPU Camera Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server running on ws://localhost:3001`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET  /api/health - Health check`);
  console.log(`  POST /api/detect - Process image`);
  console.log(`  GET  /api/info - Server information`);
});


