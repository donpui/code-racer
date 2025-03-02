import * as THREE from 'three';
import { TrackParameters } from './TrackParameters.js';
import { TrackSegmentFactory } from './TrackSegmentFactory.js';
import { TrackCurveFactory } from './TrackCurveFactory.js';
import { TrackConnector } from './TrackConnector.js';
import { TrackMathUtils } from './TrackMathUtils.js';

/**
 * Main class to generate 3D racing tracks based on GitHub repository analysis
 */
class TrackGenerator {
  constructor() {
    // Track configuration
    this.segmentLength = 10;
    this.curveRadius = 6;
    this.curveAngle = 90;
    
    // Track state
    this.segments = [];
    this.currentPosition = [0, 0, 0];
    this.currentDirection = [0, 0, 1]; // Start facing positive Z
    this.currentRotationY = 0; // 0 radians = looking along positive Z
  }
  
  /**
   * Generate a complete race track from repository analysis data
   * @param {Object} repoData - Repository analysis data
   * @returns {Object} Track data with straights, curves, and obstacles
   */
  generateTrack(repoData = {}) {
    // Extract repository metrics
    const {
      fileCount = 30,
      complexity = 0.5,
      languages = ['JavaScript']
    } = repoData;
    
    // Calculate track parameters based on repository data
    const segmentCount = Math.min(Math.max(Math.round(fileCount / 5), 10), 25);
    const curveFrequency = TrackParameters.calculateCurveFrequency(complexity);
    const trackWidth = Math.round(TrackParameters.calculateTrackWidth(languages));
    
    console.log("Track generation parameters:", {
      segmentCount,
      curveFrequency,
      trackWidth
    });
    
    // Reset track state
    this.segments = [];
    this.straights = [];
    this.curves = [];
    this.currentPosition = [0, 0, 0];
    this.currentDirection = [0, 0, 1];
    this.currentRotationY = 0;
    
    // Generate base track geometry using helper methods
    this.generateBaseGeometry(segmentCount, curveFrequency);
    
    // Convert track segments to visual representations with proper width and colors
    this.createVisualSegments(trackWidth);
    
    // Verify track connections for debugging
    this.verifyTrackConnections();
    
    // Calculate total track length
    const totalLength = Math.round(
      this.straights.reduce((sum, segment) => sum + segment.length, 0) + 
      this.curves.length * (Math.PI * this.curveRadius / 2)
    );
    
    // Create track data with separate arrays and metadata
    const trackData = {
      straights: this.straights,
      curves: this.curves,
      obstacles: [],
      metadata: {
        length: totalLength,
        complexity: complexity,
        turns: this.curves.length,
        width: trackWidth
      }
    };
    
    // Return completed track
    console.log(`Generated track with ${this.straights.length} straights and ${this.curves.length} curves`);
    return trackData;
  }
  
  /**
   * Generate the base geometry for the track
   * @param {number} segmentCount - Total number of segments to generate
   * @param {number} curveFrequency - How frequently to add curves (0-1)
   */
  generateBaseGeometry(segmentCount, curveFrequency) {
    // Add the first straight segment
    this.addStraightSegment(this.segmentLength);
    
    // After adding the first segment, update current position to the END of the first segment
    this.currentPosition = TrackMathUtils.calculateSegmentEndPosition(
      this.segments[0].position,
      this.currentDirection,
      this.segmentLength
    );
    
    console.log(`After first segment:
      End position: [${this.currentPosition}]
      Direction: [${this.currentDirection}]`);
    
    // Calculate number of curves based on segment count and complexity
    const numCurves = Math.max(1, Math.floor(segmentCount * curveFrequency));
    
    // Generate remaining track segments with curves
    for (let i = 0; i < numCurves; i++) {
      // Add a curve, alternating between right and left turns
      const isRightTurn = i % 2 === 0;
      this.addCurve(isRightTurn);
      
      // Add straight segments after each curve
      const straightSegmentsAfterCurve = Math.floor((segmentCount - 1) / numCurves);
      for (let j = 0; j < straightSegmentsAfterCurve; j++) {
        this.addStraightSegment(this.segmentLength);
      }
    }
  }
  
  /**
   * Create visual representations of track segments with proper width and colors
   * @param {number} trackWidth - Width of the track
   */
  createVisualSegments(trackWidth) {
    // Process all segments and create visual representations
    this.segments.forEach((segment, index) => {
      // Choose segment color based on type and position
      const color = this.getSegmentColor(segment, index);
      
      if (segment.type === 'straight') {
        // Create straight segment visual
        const visualSegment = TrackSegmentFactory.createSegment({
          position: segment.position,
          rotation: segment.rotation,
          length: segment.length,
          width: trackWidth,
          color: color,
          type: 'straight'
        });
        this.straights.push(visualSegment);
      } 
      else if (segment.type === 'curve') {
        // Create curve segment visual
        const visualCurve = TrackCurveFactory.createCurve({
          position: segment.position,
          rotation: segment.rotation,
          radius: segment.radius,
          angle: segment.angle,
          width: trackWidth,
          color: color,
          isRightTurn: segment.isRightTurn
        });
        this.curves.push(visualCurve);
      }
    });
  }
  
  /**
   * Get color for a track segment based on type and position
   * @param {Object} segment - Track segment
   * @param {number} index - Segment index
   * @returns {string} Color hex code
   */
  getSegmentColor(segment, index) {
    // Different colors for straights vs curves
    if (segment.type === 'straight') {
      return "#3b36e2"; // Blue for straight segments
    } else {
      return "#e29d36"; // Orange for curves
    }
  }
  
  /**
   * Generate a simple track for testing purposes
   * @param {number} numStraightSegments - Number of straight segments
   * @param {number} numCurves - Number of curves
   * @returns {Object} Track data with straights, curves, and obstacles
   */
  generateSimpleTrack(numStraightSegments = 3, numCurves = 1) {
    // Clear existing track
    this.segments = [];
    this.straights = [];
    this.curves = [];
    
    // Reset position and direction
    this.currentPosition = [0, 0, 0];
    this.currentDirection = [0, 0, 1]; // Start facing positive Z
    this.currentRotationY = 0;
    
    // Generate track pieces
    this.addStraightSegment(this.segmentLength);
    
    // The first segment is placed with its start at [0,0,0]
    // But we need to update our current position to be at the END of the first segment
    this.currentPosition = TrackMathUtils.calculateSegmentEndPosition(
      this.segments[0].position,
      this.currentDirection,
      this.segmentLength
    );
    
    console.log(`After first segment:
      End position: [${this.currentPosition}]
      Direction: [${this.currentDirection}]`);
      
    // Add remaining straight segments and curves
    for (let i = 0; i < numCurves; i++) {
      // Add a right curve
      this.addCurve(true);
      
      // Add straight segments after each curve
      const segmentsAfterCurve = Math.floor(numStraightSegments / (numCurves + 1));
      for (let j = 0; j < segmentsAfterCurve; j++) {
        this.addStraightSegment(this.segmentLength);
      }
    }
    
    // Create visual representations with default width
    this.createVisualSegments(5);
    
    // Verify connections between segments for debugging
    this.verifyTrackConnections();

    // Calculate total track length
    const totalLength = Math.round(
      this.straights.reduce((sum, segment) => sum + segment.length, 0) + 
      this.curves.length * (Math.PI * this.curveRadius / 2)
    );
    
    // Create track data with separate arrays and metadata
    const trackData = {
      straights: this.straights,
      curves: this.curves,
      obstacles: [],
      metadata: {
        length: totalLength,
        complexity: 0.5,
        turns: this.curves.length,
        width: 5
      }
    };
    
    return trackData;
  }
  
  /**
   * Add a straight segment to the track
   * @param {number} length - Segment length
   */
  addStraightSegment(length) {
    // Calculate the center position for the segment
    const centerPosition = TrackMathUtils.calculateCenterForNextSegment(
      this.currentPosition,
      this.currentDirection,
      length
    );
    
    // Create segment data
    const segment = {
      type: 'straight',
      position: centerPosition,
      rotation: [0, this.currentRotationY, 0],
      direction: [...this.currentDirection],
      length: length
    };
    
    // Add to segments list
    this.segments.push(segment);
    
    console.log(`Adding straight segment:
      Start: [${this.currentPosition}]
      Center: [${centerPosition}]
      Direction: [${this.currentDirection}]`);
    
    // Update current position to end of this segment
    this.currentPosition = TrackMathUtils.calculateSegmentEndPosition(
      centerPosition,
      this.currentDirection,
      length
    );
    
    // Console log the current state
    console.log(`After straight segment:
      End position: [${this.currentPosition}]
      Direction: [${this.currentDirection}]`);
  }
  
  /**
   * Add a curve to the track
   * @param {boolean} isRightTurn - Whether curve turns right
   */
  addCurve(isRightTurn = true) {
    // Calculate the center position for the curve
    const centerPosition = TrackMathUtils.calculateCenterForNextCurve(
      this.currentPosition,
      this.currentDirection,
      this.currentRotationY,
      this.curveRadius,
      isRightTurn
    );
    
    // Create curve data
    const curve = {
      type: 'curve',
      position: centerPosition,
      rotation: [0, this.currentRotationY, 0],
      direction: [...this.currentDirection],
      radius: this.curveRadius,
      angle: this.curveAngle,
      isRightTurn: isRightTurn
    };
    
    // Add to segments list
    this.segments.push(curve);
    
    console.log(`Adding curve segment:
      Start: [${this.currentPosition}]
      Center: [${centerPosition}]
      Direction: [${this.currentDirection}]
      Turn: ${isRightTurn ? 'right' : 'left'}`);
    
    // Calculate curve end data
    const endData = TrackMathUtils.calculateCurveEndPosition(
      centerPosition,
      this.currentRotationY,
      this.curveRadius,
      this.curveAngle,
      isRightTurn
    );
    
    // Update track state with end data
    this.currentPosition = endData.position;
    this.currentRotationY = endData.rotationY;
    this.currentDirection = endData.direction;
    
    // Console log the current state
    console.log(`After curve:
      End position: [${this.currentPosition}]
      Direction: [${this.currentDirection}]
      Rotation: ${this.currentRotationY.toFixed(4)}`);
  }
  
  /**
   * Verify that each track piece connects properly to the next piece
   * Used for debugging track connection issues
   */
  verifyTrackConnections() {
    console.log("Verifying track connections...");
    
    for (let i = 0; i < this.segments.length - 1; i++) {
      const current = this.segments[i];
      const next = this.segments[i + 1];
      
      let currentEnd;
      if (current.type === 'straight') {
        currentEnd = TrackMathUtils.calculateSegmentEndPosition(
          current.position,
          current.direction,
          current.length
        );
      } else if (current.type === 'curve') {
        const endData = TrackMathUtils.calculateCurveEndPosition(
          current.position,
          current.rotation[1],
          current.radius,
          current.angle,
          current.isRightTurn
        );
        currentEnd = endData.position;
      }
      
      // Get next segment start position
      let nextStart;
      if (next.type === 'straight') {
        // Get the start position of the next segment (half length back from center)
        const dir = new THREE.Vector3(-next.direction[0], 0, -next.direction[2]).normalize();
        const startOffset = dir.multiplyScalar(next.length / 2);
        const center = new THREE.Vector3(next.position[0], 0, next.position[2]);
        const start = center.clone().add(startOffset);
        nextStart = [Math.round(start.x), 0, Math.round(start.z)];
      } else if (next.type === 'curve') {
        // For a curve, we need to calculate the start point
        // The start is radius units from center in direction opposite to the turn
        const dirX = next.isRightTurn ? next.direction[2] : -next.direction[2];
        const dirZ = next.isRightTurn ? -next.direction[0] : next.direction[0];
        const center = new THREE.Vector3(next.position[0], 0, next.position[2]);
        const startOffset = new THREE.Vector3(dirX, 0, dirZ).normalize().multiplyScalar(next.radius);
        const start = center.clone().add(startOffset);
        nextStart = [Math.round(start.x), 0, Math.round(start.z)];
      }
      
      // Calculate distance between end of current segment and start of next segment
      const dx = currentEnd[0] - nextStart[0];
      const dz = currentEnd[2] - nextStart[2];
      const distance = Math.sqrt(dx*dx + dz*dz);
      
      // Check if they connect properly (should be very close to 0)
      if (distance > 0.1) {
        console.warn(`Gap detected between segments ${i} and ${i+1}:
          Segment ${i} (${current.type}) end: [${currentEnd}]
          Segment ${i+1} (${next.type}) start: [${nextStart}]
          Distance: ${distance.toFixed(2)} units`);
      } else {
        console.log(`Segments ${i} and ${i+1} connect properly`);
      }
      
      // Check for sharp angles in connection
      if (i > 0) {
        const prev = this.segments[i-1];
        const current = this.segments[i];
        
        // Calculate angle between segments
        const prevDir = new THREE.Vector3(prev.direction[0], 0, prev.direction[2]).normalize();
        const currDir = new THREE.Vector3(current.direction[0], 0, current.direction[2]).normalize();
        const dot = prevDir.dot(currDir);
        const angle = Math.acos(THREE.MathUtils.clamp(dot, -1, 1)) * (180/Math.PI);
        
        if (angle > 95 || angle < 85) {
          console.warn(`Sharp angle detected between segments ${i-1} and ${i}: ${angle.toFixed(1)}°`);
        }
      }
    }
  }
}

// Export a singleton instance instead of the class
export default new TrackGenerator(); 