#ifndef OPENCV_PROCESSOR_H
#define OPENCV_PROCESSOR_H

#include <opencv2/opencv.hpp>
#include <chrono>

// Image processing class (CPU baseline)
class ImageProcessor {
public:
    static cv::Mat edgeDetectionCPU(const cv::Mat& input);
    static cv::Mat applyFilterCPU(const cv::Mat& input, const cv::Mat& kernel);
    static cv::Mat enhanceContrast(const cv::Mat& input);
};

// Performance benchmarking
struct BenchmarkResults {
    double cpuTime;
    double gpuTime;
    double speedup;
    int framesProcessed;
};

class PerformanceBenchmark {
public:
    static BenchmarkResults compareProcessing(cv::Mat& frame, int iterations);
    static void printResults(const BenchmarkResults& results);
};

#endif // OPENCV_PROCESSOR_H