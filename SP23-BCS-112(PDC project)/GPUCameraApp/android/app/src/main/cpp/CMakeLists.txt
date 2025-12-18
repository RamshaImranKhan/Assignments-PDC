cmake_minimum_required(VERSION 3.18)
project(GPUProcessor CUDA CXX)

# Enable CUDA
enable_language(CUDA)
set(CMAKE_CUDA_STANDARD 14)
set(CMAKE_CXX_STANDARD 14)

# CUDA architecture - adjust based on your phone's GPU
# Common architectures: 61 (Pascal), 70 (Volta), 75 (Turing), 80 (Ampere)
set(CMAKE_CUDA_ARCHITECTURES 61 70 75)

# OpenCV path - CHANGE THIS to your OpenCV installation
set(OpenCV_DIR "C:/opencv/build")
find_package(OpenCV REQUIRED)

# Include directories
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${OpenCV_INCLUDE_DIRS}
    ${CUDA_INCLUDE_DIRS}
)

# Add all source files
set(SOURCES
    jni_bridge.cpp
    opencv_processor.cpp
)

set(CUDA_SOURCES
    gpu_processor.cu
)

# Create shared library
add_library(gpu_processor SHARED
    ${SOURCES}
    ${CUDA_SOURCES}
)

# Link libraries
target_link_libraries(gpu_processor
    ${OpenCV_LIBS}
    android
    jnigraphics
    log
    cudart
    ${CUDA_LIBRARIES}
)

# CUDA compilation options
set_target_properties(gpu_processor PROPERTIES
    CUDA_SEPARABLE_COMPILATION ON
    CUDA_RESOLVE_DEVICE_SYMBOLS ON
)

# Add CUDA flags
target_compile_options(gpu_processor PRIVATE
    $<$<COMPILE_LANGUAGE:CUDA>:
        --use_fast_math
        -Xcompiler=-fPIC
    >
)