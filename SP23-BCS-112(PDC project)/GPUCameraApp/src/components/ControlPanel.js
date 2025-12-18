import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, Platform } from 'react-native';

const ControlPanel = ({
  processingMode,
  useGPU,
  onModeChange,
  onGPUToggle,
  isProcessing,
  onProcessingToggle
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Processing Mode</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              processingMode === 'object' && styles.modeButtonActive
            ]}
            onPress={() => onModeChange('object')}
          >
            <Text style={[
              styles.modeButtonText,
              processingMode === 'object' && styles.modeButtonTextActive
            ]}>
              Object Detection
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              processingMode === 'emotion' && styles.modeButtonActive
            ]}
            onPress={() => onModeChange('emotion')}
          >
            <Text style={[
              styles.modeButtonText,
              processingMode === 'emotion' && styles.modeButtonTextActive
            ]}>
              Emotion Recognition
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchLabel}>GPU Acceleration</Text>
            <Text style={styles.switchDescription}>
              {useGPU ? 'Enabled (CUDA)' : 'Disabled (CPU only)'}
            </Text>
          </View>
          <Switch
            value={useGPU}
            onValueChange={onGPUToggle}
            trackColor={{ false: '#767577', true: '#4CAF50' }}
            thumbColor={useGPU ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchLabel}>Processing</Text>
            <Text style={styles.switchDescription}>
              {isProcessing ? 'Active' : 'Paused'}
            </Text>
          </View>
          <Switch
            value={isProcessing}
            onValueChange={onProcessingToggle}
            trackColor={{ false: '#767577', true: '#2196F3' }}
            thumbColor={isProcessing ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>PDC Features</Text>
        <Text style={styles.infoText}>
          • Parallel GPU processing with CUDA
        </Text>
        <Text style={styles.infoText}>
          • Real-time frame analysis
        </Text>
        <Text style={styles.infoText}>
          • OpenCV-based computer vision
        </Text>
        <Text style={styles.infoText}>
          • Performance benchmarking
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#444',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  modeButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  switchLabelContainer: {
    flex: 1,
  },
  switchLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  switchDescription: {
    color: '#888',
    fontSize: 12,
  },
  infoSection: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4,
  },
});

export default ControlPanel;


