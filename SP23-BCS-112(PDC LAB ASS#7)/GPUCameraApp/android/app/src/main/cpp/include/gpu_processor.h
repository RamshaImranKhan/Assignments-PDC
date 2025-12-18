#ifndef GPU_PROCESSOR_H
#define GPU_PROCESSOR_H

#ifdef __cplusplus
extern "C" {
#endif

// RGB to Grayscale conversion on GPU
void rgbToGrayscaleGPU(
    const unsigned char* input,
    unsigned char* output,
    int width,
    int height
);

// Edge detection using Sobel operator on GPU
void edgeDetectionGPU(
    const unsigned char* input,
    unsigned char* output,
    int width,
    int height
);

// Apply convolution filter on GPU
void applyConvolutionGPU(
    const unsigned char* input,
    unsigned char* output,
    const float* filter,
    int width,
    int height,
    int filterSize
);

// Gaussian blur on GPU
void gaussianBlurGPU(
    const unsigned char* input,
    unsigned char* output,
    int width,
    int height,
    float sigma
);

#ifdef __cplusplus
}
#endif

#endif // GPU_PROCESSOR_H