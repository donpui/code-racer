import * as THREE from 'three';

/**
 * Math utilities for track generation
 */
export const TrackMathUtils = {
  /**
   * Round all values in a position array to 1 decimal place
   */
  roundPosition(position) {

    return [
      Math.round(position[0] * 10) / 10,
      0, // Always keep y at 0 for flat tracks
      Math.round(position[2] * 10) / 10
    ];
  },

  /**
   * Convert a THREE.Vector3 to a rounded position array
   */
  vectorToPosition(vector) {
    console.log("vectorToPosition", [Math.round(vector.x * 10) / 10,
      0,
      Math.round(vector.z * 10) / 10]);
    return [
      Math.round(vector.x * 10) / 10,
      0,
      Math.round(vector.z * 10) / 10
    ];
  },

  /**
   * Calculate the end position of a curve
   */
  calculateCurveEndPosition(startPos, rotationY, radius, angle, isRightTurn) {
    // Create vectors for calculation
    const startPosition = new THREE.Vector3(
      Math.round(startPos[0] * 10) / 10, 
      0, 
      Math.round(startPos[2] * 10) / 10
    );
    
    let currentRotationY = rotationY;
    
    // Update rotation based on curve direction
    if (isRightTurn) {
      currentRotationY -= Math.PI / 2; // Right turn is -90 degrees
    } else {
      currentRotationY += Math.PI / 2; // Left turn is +90 degrees
    }
    
    // Normalize rotation
    currentRotationY = currentRotationY % (Math.PI * 2);
    
    // Calculate new direction vector - keep as unit vector
    const newDirection = new THREE.Vector3(
      Math.sin(currentRotationY),
      0,
      Math.cos(currentRotationY)
    ).normalize();
    
    // Calculate the end position of the curve 
    // Instead of forcing cardinal directions, use actual direction with 1 decimal rounding
    const curveCenter = new THREE.Vector3(
      startPosition.x - radius * Math.cos(currentRotationY),
      0,
      startPosition.z - radius * Math.sin(currentRotationY)
    );
    
    if (isRightTurn) {
      // For right turn
      curveCenter.set(
        startPosition.x - radius * Math.cos(currentRotationY),
        0,
        startPosition.z - radius * Math.sin(currentRotationY)
      );
    } else {
      // For left turn
      curveCenter.set(
        startPosition.x + radius * Math.cos(currentRotationY),
        0,
        startPosition.z + radius * Math.sin(currentRotationY)
      );
    }
    
    // Calculate end position
    const endPosition = new THREE.Vector3(
      curveCenter.x + radius * Math.cos(currentRotationY - Math.PI/2),
      0,
      curveCenter.z + radius * Math.sin(currentRotationY - Math.PI/2)
    );
    
    // Round to 1 decimal place
    return {
      position: [
        Math.round(endPosition.x * 10) / 10, 
        0, 
        Math.round(endPosition.z * 10) / 10
      ],
      rotationY: currentRotationY,
      direction: [
        Math.round(newDirection.x * 10) / 10, 
        0, 
        Math.round(newDirection.z * 10) / 10
      ]
    };
  },
  
  /**
   * Calculate the end position of a straight segment
   */
  calculateSegmentEndPosition(startPos, direction, length) {
    // Ensure inputs are rounded to 1 decimal place
    const startX = Math.round(startPos[0] * 10) / 10;
    const startZ = Math.round(startPos[2] * 10) / 10;
    const roundedLength = Math.round(length * 10) / 10;
    
    // Calculate using normalized direction vector
    const dirVector = new THREE.Vector3(direction[0], 0, direction[2]).normalize();
    
    // Calculate end position 
    const endX = startX + dirVector.x * roundedLength;
    const endZ = startZ + dirVector.z * roundedLength;
    
    // Round to 1 decimal place
    return [
      Math.round(endX * 10) / 10, 
      0, 
      Math.round(endZ * 10) / 10
    ];
  }
};

export default TrackMathUtils; 