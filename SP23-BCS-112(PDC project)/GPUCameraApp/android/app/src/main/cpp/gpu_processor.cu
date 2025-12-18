// gpu_processor.cu - CUDA Kernels for Parallel Image Processing
#include <cuda_runtime.h>
#include <device_launch_parameters.h>
#include <stdio.h>
#include "include/gpu_processor.h"

// Error checking macro
#define CUDA_CHECK(call) \
    do { \
        cudaError_t err = call; \
        if (err != cudaSuccess) { \
            fprintf(stderr, "CUDA error at %s:%d - %s\n", \
                    __FILE__, __LINE__, cudaGetErrorString(err)); \
        } \
    } while(0)

// ==================== KERNEL 1: RGB TO GRAYSCALE ====================
__global__ void rgbToGrayscaleKernel(
    const unsigned char* input,
    unsigned char* output,
    int width,
    int height
) {
    // Calculate thread's position in image
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    
    // Boundary check
    if (x >= width || y >= height) return;
    
    // Input has 3 channels (RGB), output has 1 (grayscale)
    int inputIdx = (y * width + x) * 3;
    int outputIdx = y * width + x;
    
    // Weighted average for human eye perception
    float r = input[inputIdx];
    float g = input[inputIdx + 1];
    float b = input[inputIdx + 2];
    
    float gray = 0.299f * r + 0.587f * g + 0.114f * b;
    output[outputIdx] = (unsigned char)gray;
}

// ==================== KERNEL 2: SOBEL EDGE DETECTION ====================
__global__ void sobelEdgeKernel(
    const unsigned char* input,
    unsigned char* output,
    int width,
    int height
) {
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    
    // Skip borders
    if (x >= width || y >= height || x == 0 || y == 0 || 
        x == width - 1 || y == height - 1) {
        if (x < width && y < height) {
            output[y * width + x] = 0;
        }
        return;
    }
    
    // Sobel X operator (horizontal edges)
    int gx = -input[(y-1)*width + (x-1)] + input[(y-1)*width + (x+1)]
             -2*input[y*width + (x-1)] + 2*input[y*width + (x+1)]
             -input[(y+1)*width + (x-1)] + input[(y+1)*width + (x+1)];
    
    // Sobel Y operator (vertical edges)
    int gy = -input[(y-1)*width + (x-1)] - 2*input[(y-1)*width + x] - input[(y-1)*width + (x+1)]
             +input[(y+1)*width + (x-1)] + 2*input[(y+1)*width + x] + input[(y+1)*width + (x+1)];
    
    // Calculate magnitude
    int magnitude = sqrtf((float)(gx*gx + gy*gy));
    output[y * width + x] = (unsigned char)min(magnitude, 255);
}

// ==================== KERNEL 3: GAUSSIAN BLUR ====================
__global__ void gaussianBlurKernel(
    const unsigned char* input,
    unsigned char* output,
    int width,
    int height,
    float sigma
) {
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    
    if (x >= width || y >= height) return;
    
    const int radius = 5;
    float sum = 0.0f;
    float weightSum = 0.0f;
    
    // Apply Gaussian kernel
    for (int dy = -radius; dy <= radius; dy++) {
        for (int dx = -radius; dx <= radius; dx++) {
            int nx = min(max(x + dx, 0), width - 1);
            int ny = min(max(y + dy, 0), height - 1);
            
            // Gaussian weight calculation
            float weight = expf(-(dx*dx + dy*dy) / (2.0f * sigma * sigma));
            sum += input[ny * width + nx] * weight;
            weightSum += weight;
        }
    }
    
    output[y * width + x] = (unsigned char)(sum / weightSum);
}

// ==================== KERNEL 4: CONVOLUTION ====================
__global__ void convolutionKernel(
    const unsigned char* input,
    unsigned char* output,
    const float* filter,
    int width,
    int height,
    int filterSize
) {
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    
    if (x >= width || y >= height) return;
    
    float sum = 0.0f;
    int halfFilter = filterSize / 2;
    
    // Apply filter
    for (int fy = -halfFilter; fy <= halfFilter; fy++) {
        for (int fx = -halfFilter; fx <= halfFilter; fx++) {
            int imageX = min(max(x + fx, 0), width - 1);
            int imageY = min(max(y + fy, 0), height - 1);
            
            int filterIdx = (fy + halfFilter) * filterSize + (fx + halfFilter);
            int imageIdx = imageY * width + imageX;
            
            sum += input[imageIdx] * filter[filterIdx];
        }
    }
    
    output[y * width + x] = (unsigned char)min(max(sum, 0.0f), 255.0f);
}

// ==================== HOST FUNCTIONS (Called from Java) ====================

extern "C" {

void rgbToGrayscaleGPU(
    const unsigned char* h_input,
    unsigned char* h_output,
    int width,
    int height
) {
    unsigned char *d_input, *d_output;
    
    size_t inputSize = width * height * 3 * sizeof(unsigned char);
    size_t outputSize = width * height * sizeof(unsigned char);
    
    // Allocate GPU memory
    CUDA_CHECK(cudaMalloc(&d_input, inputSize));
    CUDA_CHECK(cudaMalloc(&d_output, outputSize));
    
    // Copy data to GPU
    CUDA_CHECK(cudaMemcpy(d_input, h_input, inputSize, cudaMemcpyHostToDevice));
    
    // Configure kernel launch
    dim3 blockSize(16, 16);
    dim3 gridSize((width + blockSize.x - 1) / blockSize.x,
                  (height + blockSize.y - 1) / blockSize.y);
    
    // Launch kernel
    rgbToGrayscaleKernel<<<gridSize, blockSize>>>(d_input, d_output, width, height);
    CUDA_CHECK(cudaGetLastError());
    CUDA_CHECK(cudaDeviceSynchronize());
    
    // Copy result back
    CUDA_CHECK(cudaMemcpy(h_output, d_output, outputSize, cudaMemcpyDeviceToHost));
    
    // Free GPU memory
    cudaFree(d_input);
    cudaFree(d_output);
}

void edgeDetectionGPU(
    const unsigned char* h_input,
    unsigned char* h_output,
    int width,
    int height
) {
    unsigned char *d_input, *d_output;
    size_t imageSize = width * height * sizeof(unsigned char);
    
    CUDA_CHECK(cudaMalloc(&d_input, imageSize));
    CUDA_CHECK(cudaMalloc(&d_output, imageSize));
    
    CUDA_CHECK(cudaMemcpy(d_input, h_input, imageSize, cudaMemcpyHostToDevice));
    
    dim3 blockSize(16, 16);
    dim3 gridSize((width + blockSize.x - 1) / blockSize.x,
                  (height + blockSize.y - 1) / blockSize.y);
    
    sobelEdgeKernel<<<gridSize, blockSize>>>(d_input, d_output, width, height);
    CUDA_CHECK(cudaGetLastError());
    CUDA_CHECK(cudaDeviceSynchronize());
    
    CUDA_CHECK(cudaMemcpy(h_output, d_output, imageSize, cudaMemcpyDeviceToHost));
    
    cudaFree(d_input);
    cudaFree(d_output);
}

void gaussianBlurGPU(
    const unsigned char* h_input,
    unsigned char* h_output,
    int width,
    int height,
    float sigma
) {
    unsigned char *d_input, *d_output;
    size_t imageSize = width * height * sizeof(unsigned char);
    
    CUDA_CHECK(cudaMalloc(&d_input, imageSize));
    CUDA_CHECK(cudaMalloc(&d_output, imageSize));
    
    CUDA_CHECK(cudaMemcpy(d_input, h_input, imageSize, cudaMemcpyHostToDevice));
    
    dim3 blockSize(16, 16);
    dim3 gridSize((width + blockSize.x - 1) / blockSize.x,
                  (height + blockSize.y - 1) / blockSize.y);
    
    gaussianBlurKernel<<<gridSize, blockSize>>>(d_input, d_output, width, height, sigma);
    CUDA_CHECK(cudaGetLastError());
    CUDA_CHECK(cudaDeviceSynchronize());
    
    CUDA_CHECK(cudaMemcpy(h_output, d_output, imageSize, cudaMemcpyDeviceToHost));
    
    cudaFree(d_input);
    cudaFree(d_output);
}

void applyConvolutionGPU(
    const unsigned char* h_input,
    unsigned char* h_output,
    const float* h_filter,
    int width,
    int height,
    int filterSize
) {
    unsigned char *d_input, *d_output;
    float *d_filter;
    
    size_t imageSize = width * height * sizeof(unsigned char);
    size_t filterSizeBytes = filterSize * filterSize * sizeof(float);
    
    CUDA_CHECK(cudaMalloc(&d_input, imageSize));
    CUDA_CHECK(cudaMalloc(&d_output, imageSize));
    CUDA_CHECK(cudaMalloc(&d_filter, filterSizeBytes));
    
    CUDA_CHECK(cudaMemcpy(d_input, h_input, imageSize, cudaMemcpyHostToDevice));
    CUDA_CHECK(cudaMemcpy(d_filter, h_filter, filterSizeBytes, cudaMemcpyHostToDevice));
    
    dim3 blockSize(16, 16);
    dim3 gridSize((width + blockSize.x - 1) / blockSize.x,
                  (height + blockSize.y - 1) / blockSize.y);
    
    convolutionKernel<<<gridSize, blockSize>>>(d_input, d_output, d_filter, 
                                               width, height, filterSize);
    CUDA_CHECK(cudaGetLastError());
    CUDA_CHECK(cudaDeviceSynchronize());
    
    CUDA_CHECK(cudaMemcpy(h_output, d_output, imageSize, cudaMemcpyDeviceToHost));
    
    cudaFree(d_input);
    cudaFree(d_output);
    cudaFree(d_filter);
}

} // extern "C"