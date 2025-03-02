import { TrackMathUtils } from './TrackMathUtils.js';

/**
 * Factory for creating track curves
 */
export const TrackCurveFactory = {
  /**
   * Create a curve with specified options
   * @param {Object} options - Curve options
   * @returns {Object} The created curve
   */
  createCurve(options) {
    if (!options || typeof options !== 'object') {
      // Fallback for old signature calls
      return this.createCurveLegacy(...arguments);
    }
    
    return {
      position: options.position || [0, 0, 0],
      rotation: options.rotation || [0, 0, 0],
      radius: Math.round(options.radius || 5),
      angle: options.angle || 90,
      width: Math.round(options.width || 3),
      direction: options.direction || "right",
      color: options.color || (options.direction === "right" ? "#FFA500" : "#FFCC00"),
      name: options.name || "Curve"
    };
  },
  
  /**
   * Legacy method for backwards compatibility
   * @private
   */
  createCurveLegacy(position, rotationY, trackWidth, isRightTurn) {
    // Use consistent curve radius that's an integer
    const curveRadius = Math.round(trackWidth * 1.5);
    const curveAngle = 90; // 90-degree turn
    
    // Select curve color based on direction
    const curveColor = isRightTurn ? "#FFA500" : "#FFCC00"; // Orange for right turns, yellow for left
    
    // Round positions to integers
    const roundedPosition = [
      Math.round(position[0]),
      0,
      Math.round(position[2])
    ];
    
    return {
      position: roundedPosition,
      rotation: [0, rotationY, 0],
      radius: curveRadius,
      angle: curveAngle,
      width: Math.round(trackWidth),
      direction: isRightTurn ? "right" : "left",
      color: curveColor
    };
  },
  
  /**
   * Calculate the output properties after a curve
   */
  calculateCurveOutput(curve, currentDirection) {
    // Use TrackMathUtils to calculate curve outputs
    return TrackMathUtils.calculateCurveEndPosition(
      curve.position,
      curve.rotation[1],
      curve.radius,
      curve.angle,
      curve.direction === "right"
    );
  }
};

export default TrackCurveFactory; 