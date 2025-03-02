import { TrackMathUtils } from './TrackMathUtils.js';
import * as THREE from 'three';

/**
 * Factory for creating track straight segments
 */
export const TrackSegmentFactory = {
  /**
   * Create a starting segment at origin
   */
  createStartingSegment(length, width, color = "#3b36e2") {
    return {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      length: Math.round(length * 10) / 10,
      width: Math.round(width * 10) / 10,
      color: color
    };
  },
  
  /**
   * Create a segment with specified options
   * @param {Object} options - Segment options
   * @returns {Object} The created segment
   */
  createSegment(options) {
    if (!options || typeof options !== 'object') {
      // Fallback for old signature calls
      return this.createSegmentLegacy(...arguments);
    }
    
    return {
      position: options.position || [0, 0, 0],
      rotation: options.rotation || [0, 0, 0],
      length: Math.round(options.length || 10),
      width: Math.round(options.width || 3),
      color: options.color || "#3b36e2",
      name: options.name || "Segment"
    };
  },
  
  /**
   * Legacy method for backwards compatibility
   * @private
   */
  createSegmentLegacy(startPosition, rotationY, length, width, color) {
    return {
      position: Array.isArray(startPosition) ? startPosition : [0, 0, 0],
      rotation: [0, rotationY || 0, 0],
      length: Math.round(length * 10) / 10,
      width: Math.round(width * 10) / 10,
      color: color || "#3b36e2"
    };
  },
  
  /**
   * Create a segment with variable length
   */
  createVariableSegment(startPosition, rotationY, baseLength, width, color, variationFactor = 0.15) {
    // Calculate a random length variation
    const variation = 1 + (Math.random() * variationFactor * 2 - variationFactor);
    const length = Math.round(baseLength * variation);
    
    return this.createSegmentLegacy(startPosition, rotationY, length, width, color);
  },
  
  /**
   * Calculate next position after this segment
   */
  calculateNextPosition(segment, direction) {
    // Convert arrays to THREE vectors for calculation
    const pos = new THREE.Vector3(...segment.position);
    const dir = new THREE.Vector3(...direction);
    
    // Scale direction by segment length and add to position
    dir.multiplyScalar(segment.length);
    pos.add(dir);
    
    // Return as rounded array
    return [Math.round(pos.x), 0, Math.round(pos.z)];
  }
};

export default TrackSegmentFactory; 