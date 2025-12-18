// opencv_processor.cpp - CPU-based processing (baseline for comparison)
#include "include/opencv_processor.h"
#include "include/gpu_processor.h"
#include <android/log.h>

#define LOG_TAG "OpenCVProcessor"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

using namespace cv;
using namespace std;

// CPU-based edge detection (baseline)
Mat ImageProcessor::edgeDetectionCPU(const Mat& input) {
    Mat gray, edges;
    
    auto start = chrono::high_resolution_clock::now();
    
    // Convert to grayscale
    if (input.channels() == 3 || input.channels() == 4) {
        cvtColor(input, gray, COLOR_BGR2GRAY);
    } else {
        gray = input.clone();
    }
    
    // Apply Gaussian blur
    GaussianBlur(gray, gray, Size(5, 5), 1.4);
    
    // Canny edge detection
    Canny(gray, edges, 50, 150);
    
    auto end = chrono::high_resolution_clock::now();
    auto duration = chrono::duration_cast<chrono::milliseconds>(end - start);
    
    LOGI("CPU Edge Detection: %ld ms", duration.count());
    
    return edges;
}

// Apply custom filter on CPU
Mat ImageProcessor::applyFilterCPU(const Mat& input, const Mat& kernel) {
    Mat output;
    
    auto start = chrono::high_resolution_clock::now();
    
    filter2D(input, output, -1, kernel);
    
    auto end = chrono::high_resolution_clock::now();
    auto duration = chrono::duration_cast<chrono::milliseconds>(end - start);
    
    LOGI("CPU Convolution: %ld ms", duration.count());
    
    return output;
}

// Enhance contrast using histogram equalization
Mat ImageProcessor::enhanceContrast(const Mat& input) {
    Mat gray, enhanced;
    
    if (input.channels() == 3 || input.channels() == 4) {
        cvtColor(input, gray, COLOR_BGR2GRAY);
    } else {
        gray = input.clone();
    }
    
    equalizeHist(gray, enhanced);
    
    return enhanced;
}

// Benchmark CPU vs GPU performance
BenchmarkResults PerformanceBenchmark::compareProcessing(Mat& frame, int iterations) {
    BenchmarkResults results;
    results.framesProcessed = iterations;
    
    // Prepare grayscale image
    Mat gray;
    if (frame.channels() == 3 || frame.channels() == 4) {
        cvtColor(frame, gray, COLOR_BGR2GRAY);
    } else {
        gray = frame.clone();
    }
    
    int width = gray.cols;
    int height = gray.rows;
    
    LOGI("Starting benchmark: %d iterations on %dx%d image", iterations, width, height);
    
    // CPU benchmark
    auto cpuStart = chrono::high_resolution_clock::now();
    for (int i = 0; i < iterations; i++) {
        Mat edges = ImageProcessor::edgeDetectionCPU(gray);
    }
    auto cpuEnd = chrono::high_resolution_clock::now();
    results.cpuTime = chrono::duration_cast<chrono::milliseconds>(cpuEnd - cpuStart).count();
    
    // GPU benchmark
    unsigned char* output = new unsigned char[width * height];
    auto gpuStart = chrono::high_resolution_clock::now();
    for (int i = 0; i < iterations; i++) {
        edgeDetectionGPU(gray.data, output, width, height);
    }
    auto gpuEnd = chrono::high_resolution_clock::now();
    results.gpuTime = chrono::duration_cast<chrono::milliseconds>(gpuEnd - gpuStart).count();
    
    delete[] output;
    
    // Calculate speedup
    results.speedup = results.cpuTime / results.gpuTime;
    
    LOGI("Benchmark complete:");
    LOGI("  CPU: %.2f ms", results.cpuTime);
    LOGI("  GPU: %.2f ms", results.gpuTime);
    LOGI("  Speedup: %.2fx", results.speedup);
    
    return results;
}

void PerformanceBenchmark::printResults(const BenchmarkResults& results) {
    LOGI("=== Performance Benchmark Results ===");
    LOGI("Frames processed: %d", results.framesProcessed);
    LOGI("CPU Time: %.2f ms (%.2f FPS)", 
         results.cpuTime, 1000.0 * results.framesProcessed / results.cpuTime);
    LOGI("GPU Time: %.2f ms (%.2f FPS)", 
         results.gpuTime, 1000.0 * results.framesProcessed / results.gpuTime);
    LOGI("Speedup: %.2fx", results.speedup);
    LOGI("====================================");
}