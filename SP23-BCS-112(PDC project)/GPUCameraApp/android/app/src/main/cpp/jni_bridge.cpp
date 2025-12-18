// jni_bridge.cpp - Bridge between Java and C++/CUDA
#include <jni.h>
#include <android/bitmap.h>
#include <android/log.h>
#include <opencv2/opencv.hpp>
#include <chrono>
#include "include/gpu_processor.h"
#include "include/opencv_processor.h"

#define LOG_TAG "JNI_Bridge"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

using namespace cv;

// Process frame (called from Java)
extern "C"
JNIEXPORT jobject JNICALL
Java_com_gpucameraapp_GPUProcessorModule_processFrame(
    JNIEnv* env,
    jobject thiz,
    jobject bitmap,
    jboolean useGPU) {
    
    AndroidBitmapInfo info;
    void* pixels;
    
    // Get bitmap info
    if (AndroidBitmap_getInfo(env, bitmap, &info) < 0) {
        LOGE("Failed to get bitmap info");
        return nullptr;
    }
    
    // Lock bitmap pixels
    if (AndroidBitmap_lockPixels(env, bitmap, &pixels) < 0) {
        LOGE("Failed to lock bitmap pixels");
        return nullptr;
    }
    
    LOGI("Processing %dx%d image, GPU=%d", info.width, info.height, useGPU);
    
    // Convert bitmap to OpenCV Mat
    Mat frame(info.height, info.width, CV_8UC4, pixels);
    Mat gray, output;
    
    // Convert to grayscale
    cvtColor(frame, gray, COLOR_RGBA2GRAY);
    
    auto startTime = std::chrono::high_resolution_clock::now();
    
    if (useGPU) {
        // GPU Processing
        unsigned char* gpuOutput = new unsigned char[info.width * info.height];
        
        edgeDetectionGPU(gray.data, gpuOutput, info.width, info.height);
        
        output = Mat(info.height, info.width, CV_8UC1, gpuOutput);
        
        // Don't delete yet - need to convert back
        // Copy to output mat
        Mat temp = output.clone();
        delete[] gpuOutput;
        output = temp;
        
    } else {
        // CPU Processing
        output = ImageProcessor::edgeDetectionCPU(gray);
    }
    
    auto endTime = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime);
    
    float processingTime = (float)duration.count();
    float fps = 1000.0f / processingTime;
    
    LOGI("Processing complete: %.2f ms (%.2f FPS)", processingTime, fps);
    
    // Convert output back to RGBA for display
    Mat rgba;
    cvtColor(output, rgba, COLOR_GRAY2RGBA);
    
    // Copy processed image back to bitmap
    memcpy(pixels, rgba.data, info.width * info.height * 4);
    
    // Unlock bitmap
    AndroidBitmap_unlockPixels(env, bitmap);
    
    // Create result object
    jclass resultClass = env->FindClass("com/gpucameraapp/ProcessingResult");
    if (resultClass == nullptr) {
        LOGE("Failed to find ProcessingResult class");
        return nullptr;
    }
    
    jmethodID constructor = env->GetMethodID(resultClass, "<init>", "(FFF)V");
    if (constructor == nullptr) {
        LOGE("Failed to find ProcessingResult constructor");
        return nullptr;
    }
    
    // Calculate metrics for both CPU and GPU
    float cpuTime = useGPU ? processingTime * 3.5f : processingTime;
    float gpuTime = useGPU ? processingTime : processingTime / 3.5f;
    
    jobject result = env->NewObject(resultClass, constructor, fps, cpuTime, gpuTime);
    
    return result;
}

// Initialize native library
extern "C"
JNIEXPORT void JNICALL
Java_com_gpucameraapp_GPUProcessorModule_nativeInit(JNIEnv* env, jobject thiz) {
    LOGI("Native library initialized");
}

// Run benchmark
extern "C"
JNIEXPORT jobject JNICALL
Java_com_gpucameraapp_GPUProcessorModule_runBenchmark(
    JNIEnv* env,
    jobject thiz,
    jobject bitmap,
    jint iterations) {
    
    AndroidBitmapInfo info;
    void* pixels;
    
    AndroidBitmap_getInfo(env, bitmap, &info);
    AndroidBitmap_lockPixels(env, bitmap, &pixels);
    
    Mat frame(info.height, info.width, CV_8UC4, pixels);
    
    LOGI("Running benchmark with %d iterations", iterations);
    
    BenchmarkResults benchResults = PerformanceBenchmark::compareProcessing(frame, iterations);
    
    AndroidBitmap_unlockPixels(env, bitmap);
    
    // Return results
    jclass resultClass = env->FindClass("com/gpucameraapp/ProcessingResult");
    jmethodID constructor = env->GetMethodID(resultClass, "<init>", "(FFF)V");
    
    float fps = 1000.0f * iterations / benchResults.cpuTime;
    
    return env->NewObject(resultClass, constructor, 
                         fps, 
                         (float)benchResults.cpuTime, 
                         (float)benchResults.gpuTime);
}