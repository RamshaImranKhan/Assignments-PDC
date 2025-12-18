import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, Text, Platform, Dimensions } from 'react-native';

// For web platform
const isWeb = Platform.OS === 'web';

// Simulated camera component for web
const WebCameraView = ({ onFrameProcessed, processingMode, useGPU }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [detections, setDetections] = useState([]);
  const [cameraError, setCameraError] = useState(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const fpsRef = useRef(0);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (isWeb) {
      // Use setTimeout to ensure DOM is ready
      const timer = setTimeout(() => {
        if (containerRef.current) {
          // Get the underlying DOM element from React Native Web
          const containerElement = containerRef.current;
          let domNode = null;
          
          // Try multiple ways to access the DOM node
          if (containerElement._nativeNode) {
            domNode = containerElement._nativeNode;
          } else if (containerElement.nodeType) {
            domNode = containerElement;
          } else if (typeof containerElement === 'object' && containerElement.current) {
            domNode = containerElement.current;
          }

          // If we can't find the DOM node, create a wrapper div
          if (!domNode || !domNode.appendChild) {
            // Create a wrapper div and append to body temporarily to find the container
            const wrapper = document.createElement('div');
            wrapper.style.width = '100%';
            wrapper.style.height = '100%';
            wrapper.style.position = 'relative';
            wrapper.style.backgroundColor = '#000';
            
            // Create video and canvas elements
            const video = document.createElement('video');
            video.autoplay = true;
            video.playsInline = true;
            video.muted = true;
            video.style.display = 'none';
            video.style.position = 'absolute';
            videoRef.current = video;

            const canvas = document.createElement('canvas');
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.objectFit = 'contain';
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvasRef.current = canvas;

            wrapper.appendChild(video);
            wrapper.appendChild(canvas);

            // Try to find the actual container in the DOM
            const findAndReplace = () => {
              const allDivs = document.querySelectorAll('div');
              for (let div of allDivs) {
                if (div.getAttribute('data-testid') === 'camera-container' || 
                    (div.style && div.style.flex === '1')) {
                  div.appendChild(wrapper);
                  break;
                }
              }
            };
            
            findAndReplace();
            
            // Fallback: append to body
            if (!wrapper.parentNode) {
              document.body.appendChild(wrapper);
            }

            startWebCamera();
            return;
          }

          // Create video and canvas elements
          const video = document.createElement('video');
          video.autoplay = true;
          video.playsInline = true;
          video.muted = true;
          video.style.display = 'none';
          video.style.position = 'absolute';
          videoRef.current = video;

          const canvas = document.createElement('canvas');
          canvas.style.width = '100%';
          canvas.style.height = '100%';
          canvas.style.objectFit = 'contain';
          canvas.style.position = 'absolute';
          canvas.style.top = '0';
          canvas.style.left = '0';
          canvasRef.current = canvas;

          // Append to DOM
          domNode.appendChild(video);
          domNode.appendChild(canvas);

          startWebCamera();
        } else {
          // Fallback: start simulated feed
          simulateCameraFeed();
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        stopWebCamera();
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (videoRef.current && videoRef.current.parentNode) {
          videoRef.current.parentNode.removeChild(videoRef.current);
        }
        if (canvasRef.current && canvasRef.current.parentNode) {
          canvasRef.current.parentNode.removeChild(canvasRef.current);
        }
      };
    } else {
      // For native, just show placeholder
      simulateCameraFeed();
    }
  }, []);

  useEffect(() => {
    if (isWeb && stream) {
      processFrames();
    }
  }, [stream, processingMode, useGPU]);

  const startWebCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', // Use 'user' for front camera, 'environment' for back
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
        });
        setStream(mediaStream);
        setCameraError(null);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError(error.message);
      // Simulate camera for demo purposes
      simulateCameraFeed();
    }
  };

  const simulateCameraFeed = () => {
    // Create a simulated feed using canvas
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = 640;
      canvas.height = 480;
      
      // Draw a gradient background to simulate camera feed
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add text
      ctx.fillStyle = '#fff';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Camera Feed Simulation', canvas.width / 2, canvas.height / 2);
      ctx.fillText('(Grant camera permission for real feed)', canvas.width / 2, canvas.height / 2 + 30);
      
      // Start processing simulated frames
      processSimulatedFrames();
    }
  };

  const processSimulatedFrames = () => {
    if (!canvasRef.current) return;
    
    const processFrame = () => {
      const startTime = performance.now();
      const detections = simulateDetection(processingMode);
      setDetections(detections);
      
      const processingTime = performance.now() - startTime;
      frameCountRef.current++;
      const now = Date.now();
      if (now - lastTimeRef.current >= 1000) {
        fpsRef.current = frameCountRef.current;
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      if (onFrameProcessed) {
        onFrameProcessed({
          fps: fpsRef.current,
          processingTime: processingTime.toFixed(2),
          gpuAcceleration: useGPU,
          detectedObjects: detections
        });
      }
      
      animationFrameRef.current = requestAnimationFrame(processFrame);
    };
    
    processFrame();
  };

  const stopWebCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const processFrames = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const processFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const startTime = performance.now();
        
        // Draw video frame to canvas
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Simulate GPU-accelerated processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const processedData = simulateGPUProcessing(imageData, processingMode, useGPU);
        ctx.putImageData(processedData, 0, 0);

        // Simulate object/emotion detection
        const detections = simulateDetection(processingMode);
        setDetections(detections);

        // Draw bounding boxes
        drawDetections(ctx, detections, canvas.width, canvas.height);

        // Calculate performance metrics
        const processingTime = performance.now() - startTime;
        frameCountRef.current++;
        const now = Date.now();
        if (now - lastTimeRef.current >= 1000) {
          fpsRef.current = frameCountRef.current;
          frameCountRef.current = 0;
          lastTimeRef.current = now;
        }

        if (onFrameProcessed) {
          onFrameProcessed({
            fps: fpsRef.current,
            processingTime: processingTime.toFixed(2),
            gpuAcceleration: useGPU,
            detectedObjects: detections
          });
        }
      }
      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    processFrame();
  };

  const simulateGPUProcessing = (imageData, mode, gpuEnabled) => {
    const data = imageData.data;
    const length = data.length;

    // Simulate GPU-accelerated edge detection or filtering
    if (gpuEnabled) {
      // Parallel processing simulation (faster)
      for (let i = 0; i < length; i += 4) {
        // Edge detection kernel
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Convert to grayscale for edge detection
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
    } else {
      // CPU processing (slower simulation)
      for (let i = 0; i < length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
    }

    return imageData;
  };

  const simulateDetection = (mode) => {
    // Simulate detection results
    if (mode === 'object') {
      return [
        { label: 'Person', confidence: 0.92, x: 100, y: 100, width: 150, height: 200 },
        { label: 'Phone', confidence: 0.85, x: 300, y: 200, width: 80, height: 120 }
      ];
    } else {
      return [
        { label: 'Happy', confidence: 0.88, x: 200, y: 150, width: 100, height: 120 }
      ];
    }
  };

  const drawDetections = (ctx, detections, width, height) => {
    detections.forEach(detection => {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.strokeRect(detection.x, detection.y, detection.width, detection.height);
      
      ctx.fillStyle = '#00ff00';
      ctx.font = '16px Arial';
      ctx.fillText(
        `${detection.label} (${(detection.confidence * 100).toFixed(0)}%)`,
        detection.x,
        detection.y - 5
      );
    });
  };

  // Always show something visible
  return (
    <View 
      ref={containerRef}
      style={styles.container}
      collapsable={false}
    >
      {/* Always visible placeholder */}
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Camera Feed</Text>
        <Text style={styles.placeholderSubtext}>
          Mode: {processingMode} | GPU: {useGPU ? 'ON' : 'OFF'}
        </Text>
        {isWeb && (
          <Text style={styles.infoText}>
            Web Camera: {stream ? 'Active' : 'Initializing...'}
          </Text>
        )}
        {!isWeb && (
          <Text style={styles.infoText}>
            Native camera implementation would use expo-camera
          </Text>
        )}
      </View>
      
      {/* Loading indicator */}
      {!stream && !cameraError && isWeb && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Initializing Camera...</Text>
        </View>
      )}
      
      {/* Error message */}
      {cameraError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Camera Error: {cameraError}</Text>
          <Text style={styles.errorSubtext}>Using simulated feed</Text>
        </View>
      )}
    </View>
  );
};

// Native camera component placeholder
const NativeCameraView = ({ onFrameProcessed, processingMode, useGPU }) => {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Camera Feed
        </Text>
        <Text style={styles.placeholderSubtext}>
          Mode: {processingMode} | GPU: {useGPU ? 'ON' : 'OFF'}
        </Text>
        <Text style={styles.infoText}>
          Native camera implementation would use react-native-camera
          or expo-camera with native OpenCV and CUDA modules
        </Text>
      </View>
    </View>
  );
};

const CameraView = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    // Expose methods if needed
  }));

  if (isWeb) {
    return <WebCameraView {...props} />;
  }
  return <NativeCameraView {...props} />;
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  placeholderSubtext: {
    color: '#888',
    fontSize: 16,
    marginBottom: 20,
  },
  infoText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  video: {
    display: 'none',
  },
  canvas: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  errorContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -20 }],
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginBottom: 4,
  },
  errorSubtext: {
    color: '#888',
    fontSize: 12,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -80 }, { translateY: -10 }],
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CameraView;

