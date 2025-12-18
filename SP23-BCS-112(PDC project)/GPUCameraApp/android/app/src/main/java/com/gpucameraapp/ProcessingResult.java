package com.gpucameraapp;

public class ProcessingResult {
    private float fps;
    private float cpuTime;
    private float gpuTime;
    
    public ProcessingResult(float fps, float cpuTime, float gpuTime) {
        this.fps = fps;
        this.cpuTime = cpuTime;
        this.gpuTime = gpuTime;
    }
    
    public float getFps() { 
        return fps; 
    }
    
    public float getCpuTime() { 
        return cpuTime; 
    }
    
    public float getGpuTime() { 
        return gpuTime; 
    }
    
    public float getSpeedup() {
        return cpuTime / gpuTime;
    }
    
    @Override
    public String toString() {
        return String.format("FPS: %.1f, CPU: %.1fms, GPU: %.1fms, Speedup: %.2fx", 
                           fps, cpuTime, gpuTime, getSpeedup());
    }
}