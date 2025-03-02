import * as THREE from 'three';

/**
 * Math utility functions for track generation
 */
export const TrackMathUtils = {
  /**
   * Round a position to integers
   */
  roundPosition(position) {
    if (!position || !Array.isArray(position)) {
      return [0, 0, 0];
    }
    return [
      Math.round(position[0]), 
      0, 
      Math.round(position[2] || position[1] || 0)
    ];
  },
  
  /**
   * Calculate the center position for the next curve
   * @param {Array} currentPosition - Current position (end of last piece)
   * @param {Array} currentDirection - Current direction vector
   * @param {number} currentRotationY - Current Y rotation
   * @param {number} radius - Curve radius
   * @param {boolean} isRightTurn - Whether curve turns right
   * @returns {Array} Center position for the curve
   */
  calculateCenterForNextCurve(currentPosition, currentDirection, currentRotationY, radius, isRightTurn) {
    console.log(`Calculating curve center:
      Current position: [${currentPosition}]
      Current direction: [${currentDirection}]
      isRightTurn: ${isRightTurn}`);
    
    // For 90-degree turns with cardinal directions, calculate the exact center
    // We'll work with exact directions to avoid floating point issues
    
    // Normalize current direction to avoid any potential issues
    const dirMag = Math.sqrt(currentDirection[0]**2 + currentDirection[2]**2);
    console.log('dirMag', dirMag);
    const normDir = [
      currentDirection[0] / dirMag,
      0,
      currentDirection[2] / dirMag
    ];
    
    // Calculate exact curve center based on current position and direction
    let centerX, centerZ;
    
    // For each cardinal direction, calculate exact center position
    if (Math.abs(normDir[0]) < 0.1 && Math.abs(normDir[2] - 1) < 0.1) {
      // Moving along +Z axis
      // For right turn, center is to the right (-X direction)
      // For left turn, center is to the left (+X direction)
      centerX = currentPosition[0] + (isRightTurn ? -radius : radius);
      centerZ = currentPosition[2];
    } else if (Math.abs(normDir[0] - 1) < 0.1 && Math.abs(normDir[2]) < 0.1) {
      // Moving along +X axis
      // For right turn, center is to the right (+Z direction)
      // For left turn, center is to the left (-Z direction)
      centerX = currentPosition[0];
      centerZ = currentPosition[2] + (isRightTurn ? radius : -radius);
    } else if (Math.abs(normDir[0]) < 0.1 && Math.abs(normDir[2] + 1) < 0.1) {
      // Moving along -Z axis
      // For right turn, center is to the right (+X direction)
      // For left turn, center is to the left (-X direction)
      centerX = currentPosition[0] + (isRightTurn ? radius : -radius);
      centerZ = currentPosition[2];
    } else if (Math.abs(normDir[0] + 1) < 0.1 && Math.abs(normDir[2]) < 0.1) {
      // Moving along -X axis
      // For right turn, center is to the right (-Z direction)
      // For left turn, center is to the left (+Z direction)
      centerX = currentPosition[0];
      centerZ = currentPosition[2] + (isRightTurn ? -radius : radius);
    } else {
      // For non-cardinal directions (shouldn't happen with our track)
      // Calculate perpendicular vector and use it to find center
      const perpX = isRightTurn ? -normDir[2] : normDir[2];
      const perpZ = isRightTurn ? normDir[0] : -normDir[0];
      
      centerX = currentPosition[0] + (perpX * radius);
      centerZ = currentPosition[2] + (perpZ * radius);
    }
    
    // Use exact integer positions for consistency
    const centerPos = [Math.round(centerX), 0, Math.round(centerZ)];
    
    console.log(`Curve center calculation result:
      Current position: [${currentPosition}]
      Direction: [${normDir}]
      Center position: [${centerPos}]`);
    
    return centerPos;
  },
  
  /**
   * Calculate the center position for the next segment
   * @param {Array} currentPosition - Current position (end of last piece)
   * @param {Array} currentDirection - Current direction vector
   * @param {number} segmentLength - Length of the segment
   * @returns {Array} Center position for the segment
   */
  calculateCenterForNextSegment(currentPosition, currentDirection, segmentLength) {
    // The segment center is half the segment length along the current direction
    // Normalize the direction vector first for consistency
    const dirMag = Math.sqrt(currentDirection[0]**2 + currentDirection[2]**2);


    const normDir = [
      currentDirection[0] / dirMag,
      0,
      currentDirection[2] / dirMag
    ];
    
    // Scale by half the segment length
    const halfLength = segmentLength / 2;
    const offsetX = normDir[0] * halfLength;
    const offsetZ = normDir[2] * halfLength;
    
    // Add to current position to get segment center
    const centerX = currentPosition[0] + offsetX;
    const centerZ = currentPosition[2] + offsetZ;
    
    // Round to integers for consistency
    return [Math.round(centerX), 0, Math.round(centerZ)];
  },
  
  /**
   * Calculate the end position after a curve
   * @param {Array} centerPosition - Curve center position
   * @param {number} startRotationY - Starting Y rotation
   * @param {number} radius - Curve radius
   * @param {number} angle - Curve angle in degrees
   * @param {boolean} isRightTurn - Whether curve turns right
   * @returns {Object} End position, rotation and direction
   */
  calculateCurveEndPosition(centerPosition, startRotationY, radius, angle, isRightTurn) {
    // For 90-degree turns, we need special consistent handling

    console.log('radius', radius, 'angle', angle, 'isRightTurn', isRightTurn);
    if (angle === 90) {
      // Determine the new direction precisely based on the turn
      let newRotationY;
      if (isRightTurn) {
        newRotationY = startRotationY - Math.PI/2;
      } else {
        newRotationY = startRotationY + Math.PI/2;
      }
      
      // Normalize rotation to 0-2π range
      while (newRotationY < 0) newRotationY += Math.PI * 2;
      while (newRotationY >= Math.PI * 2) newRotationY -= Math.PI * 2;
      
      // For 90-degree turns at cardinal directions, use exact values
      let dirX = 0, dirZ = 0;
      let newCenterPosition = [0, 0, 0];
      
      // Determine exact direction vector based on new rotation
      if (Math.abs(newRotationY) < 0.1 || Math.abs(newRotationY - 2*Math.PI) < 0.1) {
        // Looking along +Z axis
        dirX = 0;
        dirZ = 1;
        newCenterPosition = [centerPosition[0]-radius, 0, centerPosition[2] - radius];
      } else if (Math.abs(newRotationY - Math.PI/2) < 0.1) {
        // Looking along +X axis
        dirX = 1;
        dirZ = 0;
        newCenterPosition = [centerPosition[0] - radius, 0, centerPosition[2]];
      } else if (Math.abs(newRotationY - Math.PI) < 0.1) {
        // Looking along -Z axis
        dirX = 0;
        dirZ = -1;
        newCenterPosition = [centerPosition[0], 0, centerPosition[2] + radius];
      } else if (Math.abs(newRotationY - 3*Math.PI/2) < 0.1) {
        // Looking along -X axis
        dirX = -1;
        dirZ = 0;
        newCenterPosition = [centerPosition[0] + radius, 0, centerPosition[2]+radius];
      } else {
        dirX = Math.sin(newRotationY);
        dirZ = Math.cos(newRotationY);
        newCenterPosition = [centerPosition[0] + (dirX * radius), 0, centerPosition[2] + (dirZ * radius)];
      }
      
      // Important: For a 90-degree curve, calculate the end position 
      // that's on the opposite side of the center from where we'd expect
      // This ensures correct connection with the next segment
      const position = [
        Math.round(newCenterPosition[0] + (dirX * radius)), 
        0, 
        Math.round(newCenterPosition[2] + (dirZ * radius))
      ];
      
      const direction = [dirX, 0, dirZ];
      
      console.log(`90° Curve end calculation (modified):
        Center: [${newCenterPosition}]
        Turn: ${isRightTurn ? "right" : "left"}
        New rotation: ${newRotationY.toFixed(4)} rad
        New direction: [${direction}]
        End position: [${position}]`);
      
      return {
        position: position,
        rotationY: newRotationY,
        direction: direction
      };
    }
    
    // For non-90-degree turns (not used in our case)
    const angleRad = (angle * Math.PI) / 180;
    let newRotationY = startRotationY + (isRightTurn ? -angleRad : angleRad);
    
    // Normalize rotation
    while (newRotationY < 0) newRotationY += Math.PI * 2;
    while (newRotationY >= Math.PI * 2) newRotationY -= Math.PI * 2;
    
    // Calculate direction vector
    const dirX = Math.sin(newRotationY);
    const dirZ = Math.cos(newRotationY);
    
    // Calculate end position
    const endX = centerPosition[0] + (dirX * radius);
    const endZ = centerPosition[2] + (dirZ * radius);
    
    const position = [Math.round(endX), 0, Math.round(endZ)];
    const direction = [dirX, 0, dirZ];
    
    console.log(`General curve end calculation:
      Center: [${centerPosition}]
      New rotation: ${newRotationY.toFixed(4)} rad
      New direction: [${direction}]
      End position: [${position}]`);
    
    return {
      position: position,
      rotationY: newRotationY,
      direction: direction
    };
  },
  
  /**
   * Calculate end position after a straight segment
   * @param {Array} centerPosition - Center position of segment
   * @param {Array} direction - Direction vector
   * @param {number} length - Segment length
   * @returns {Array} End position after the segment
   */
  calculateSegmentEndPosition(centerPosition, direction, length) {
    if (!centerPosition || !direction || !length) {
      return [0, 0, 0];
    }
    
    // Normalize direction first
    const dirMag = Math.sqrt(direction[0]**2 + direction[2]**2);
    const normDir = [
      direction[0] / dirMag,
      0,
      direction[2] / dirMag
    ];
    
    // Calculate end position (half length from center in direction)
    const halfLength = length / 2;
    const endX = centerPosition[0] + (normDir[0] * halfLength);
    const endZ = centerPosition[2] + (normDir[2] * halfLength);
    
    // Return rounded integer positions
    return [Math.round(endX), 0, Math.round(endZ)];
  }
};

export default TrackMathUtils; 