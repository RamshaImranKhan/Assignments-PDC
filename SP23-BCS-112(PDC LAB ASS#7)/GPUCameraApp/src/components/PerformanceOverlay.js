import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const PerformanceOverlay = ({ metrics }) => {
  const { fps, processingTime, gpuAcceleration, detectedObjects } = metrics;

  return (
    <View style={styles.overlay}>
      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>FPS</Text>
        <Text style={styles.metricValue}>{fps || 0}</Text>
      </View>
      
      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>Processing</Text>
        <Text style={styles.metricValue}>
          {processingTime ? `${processingTime}ms` : '0ms'}
        </Text>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>GPU</Text>
        <View style={[
          styles.statusIndicator,
          gpuAcceleration ? styles.statusActive : styles.statusInactive
        ]}>
          <Text style={styles.statusText}>
            {gpuAcceleration ? 'ON' : 'OFF'}
          </Text>
        </View>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>Detections</Text>
        <Text style={styles.metricValue}>
          {detectedObjects?.length || 0}
        </Text>
      </View>

      {detectedObjects && detectedObjects.length > 0 && (
        <View style={styles.detectionsList}>
          {detectedObjects.slice(0, 3).map((obj, index) => (
            <View key={index} style={styles.detectionItem}>
              <Text style={styles.detectionLabel}>{obj.label}</Text>
              <Text style={styles.detectionConfidence}>
                {(obj.confidence * 100).toFixed(0)}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 12,
    minWidth: 150,
    zIndex: 1000,
  },
  metricCard: {
    marginBottom: 12,
  },
  metricLabel: {
    color: '#aaa',
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metricValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusActive: {
    backgroundColor: '#4CAF50',
  },
  statusInactive: {
    backgroundColor: '#666',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detectionsList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  detectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detectionLabel: {
    color: '#fff',
    fontSize: 12,
  },
  detectionConfidence: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default PerformanceOverlay;


