package com.gpucameraapp;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.io.File;

public class GPUProcessorModule extends ReactContextBaseJavaModule {
    
    // Load native library
    static {
        try {
            System.loadLibrary("gpu_processor");
        } catch (UnsatisfiedLinkError e) {
            e.printStackTrace();
        }
    }
    
    // Native method declarations
    private native ProcessingResult processFrame(Bitmap bitmap, boolean useGPU);
    private native void nativeInit();
    private native ProcessingResult runBenchmark(Bitmap bitmap, int iterations);
    
    public GPUProcessorModule(ReactApplicationContext context) {
        super(context);
        nativeInit();
    }
    
    @NonNull
    @Override
    public String getName() {
        return "GPUProcessor";
    }
    
    @ReactMethod
    public void processImage(String imagePath, boolean useGPU, Promise promise) {
        try {
            // Load image from path
            File imageFile = new File(imagePath);
            if (!imageFile.exists()) {
                promise.reject("FILE_NOT_FOUND", "Image file not found: " + imagePath);
                return;
            }
            
            Bitmap bitmap = BitmapFactory.decodeFile(imagePath);
            if (bitmap == null) {
                promise.reject("DECODE_ERROR", "Failed to decode image");
                return;
            }
            
            // Process image
            ProcessingResult result = processFrame(bitmap, useGPU);
            
            if (result == null) {
                promise.reject("PROCESSING_ERROR", "Native processing failed");
                return;
            }
            
            // Convert result to WritableMap
            WritableMap map = Arguments.createMap();
            map.putDouble("fps", result.getFps());
            map.putDouble("cpuTime", result.getCpuTime());
            map.putDouble("gpuTime", result.getGpuTime());
            map.putDouble("speedup", result.getSpeedup());
            
            promise.resolve(map);
            
            // Clean up
            bitmap.recycle();
            
        } catch (Exception e) {
            promise.reject("PROCESSING_ERROR", e.getMessage());
        }
    }
    
    @ReactMethod
    public void benchmark(String imagePath, int iterations, Promise promise) {
        try {
            Bitmap bitmap = BitmapFactory.decodeFile(imagePath);
            if (bitmap == null) {
                promise.reject("DECODE_ERROR", "Failed to decode image");
                return;
            }
            
            ProcessingResult result = runBenchmark(bitmap, iterations);
            
            WritableMap map = Arguments.createMap();
            map.putDouble("fps", result.getFps());
            map.putDouble("cpuTime", result.getCpuTime());
            map.putDouble("gpuTime", result.getGpuTime());
            map.putDouble("speedup", result.getSpeedup());
            map.putInt("iterations", iterations);
            
            promise.resolve(map);
            
            bitmap.recycle();
            
        } catch (Exception e) {
            promise.reject("BENCHMARK_ERROR", e.getMessage());
        }
    }
}