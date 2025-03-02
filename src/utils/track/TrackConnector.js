import * as THREE from 'three';
import { TrackCurveFactory } from './TrackCurveFactory.js';
import { TrackSegmentFactory } from './TrackSegmentFactory.js';
import { TrackMathUtils } from './TrackMathUtils.js';

/**
 * Functions for closing the track loop
 */
export const TrackConnector = {
  /**
   * Connect the end of the track back to the start
   * @param {Array} straights - Track straight segments
   * @param {Array} curves - Track curve segments
   * @param {Array} currentPosition - Current position
   * @param {Array} currentDirection - Current direction
   * @param {number} currentRotationY - Current Y rotation
   * @param {number} trackWidth - Track width
   */
  closeTrackLoop(straights, curves, currentPosition, currentDirection, currentRotationY, trackWidth) {
    console.log("Closing track loop");
    
    // Round current position to 1 decimal place
    const roundedPosition = [
      Math.round(currentPosition[0] * 10) / 10,
      0,
      Math.round(currentPosition[2] * 10) / 10
    ];
    
    // Calculate vector from current position to start
    const startPosition = new THREE.Vector3(0, 0, 0);
    const currentPos = new THREE.Vector3(roundedPosition[0], 0, roundedPosition[2]);
    const toStart = new THREE.Vector3().subVectors(startPosition, currentPos);
    const distance = Math.round(toStart.length() * 10) / 10;
    
    console.log("Closing track loop:", {
      currentPosition: roundedPosition,
      distanceToStart: distance
    });
    
    // For very close positions, connect directly
    if (distance < trackWidth * 2) {
      console.log("Direct connection to start - track is complete");
      return;
    }
    
    // Calculate angle to determine turn direction
    toStart.normalize();
    const dirVector = new THREE.Vector3(currentDirection[0], 0, currentDirection[2]);
    const cross = new THREE.Vector3().crossVectors(dirVector, toStart);
    const isRightTurn = cross.y < 0;
    
    // Curve radius with 1 decimal place
    const curveRadius = Math.round(trackWidth * 1.5 * 10) / 10;
    
    // First curve to turn toward start
    const firstCurve = {
      position: roundedPosition,
      rotation: [0, currentRotationY, 0],
      radius: curveRadius,
      angle: 90,
      width: Math.round(trackWidth * 10) / 10,
      direction: isRightTurn ? "right" : "left",
      color: isRightTurn ? "#FFA500" : "#FFCC00",
      name: `Closing Curve ${curves.length + 1}`
    };
    
    console.log(`Adding closing curve: position=[${roundedPosition}], direction=${isRightTurn ? "right" : "left"}`);
    curves.push(firstCurve);
    
    // Calculate new position and direction after the curve
    const curveOutput = TrackMathUtils.calculateCurveEndPosition(
      firstCurve.position, 
      currentRotationY, 
      curveRadius, 
      90, 
      isRightTurn
    );
    
    const newPosition = curveOutput.position;
    const newRotationY = curveOutput.rotationY;
    const newDirection = curveOutput.direction;
    
    // Calculate distance to start
    const newToStart = new THREE.Vector3().subVectors(
      startPosition,
      new THREE.Vector3(newPosition[0], 0, newPosition[2])
    );
    const remainingDistance = Math.round(newToStart.length() * 10) / 10;
    
    // If we're far from start, add another segment and curve
    if (remainingDistance > trackWidth * 4) {
      // Add a straight segment
      const finalSegmentLength = Math.min(Math.round(remainingDistance * 0.7 * 10) / 10, 20);
      
      const connectSegment = {
        position: newPosition,
        rotation: [0, newRotationY, 0],
        length: finalSegmentLength,
        width: Math.round(trackWidth * 10) / 10,
        color: "#3b36e2",
        name: `Connector ${straights.length}`
      };
      
      console.log(`Adding connecting segment: position=[${newPosition}], length=${finalSegmentLength}`);
      straights.push(connectSegment);
      
      // Calculate position after segment
      const segmentEndPos = TrackMathUtils.calculateSegmentEndPosition(
        connectSegment.position,
        newDirection,
        finalSegmentLength
      );
      
      // Add final curve to turn toward start
      const segmentEndVector = new THREE.Vector3(segmentEndPos[0], 0, segmentEndPos[2]);
      const finalToStart = new THREE.Vector3().subVectors(startPosition, segmentEndVector).normalize();
      const finalDirVector = new THREE.Vector3(newDirection[0], 0, newDirection[2]);
      const finalCross = new THREE.Vector3().crossVectors(finalDirVector, finalToStart);
      const isFinalRightTurn = finalCross.y < 0;
      
      const finalCurve = {
        position: segmentEndPos,
        rotation: [0, newRotationY, 0],
        radius: curveRadius,
        angle: 90,
        width: Math.round(trackWidth * 10) / 10,
        direction: isFinalRightTurn ? "right" : "left",
        color: isFinalRightTurn ? "#FFA500" : "#FFCC00",
        name: `Final Curve ${curves.length + 1}`
      };
      
      console.log(`Adding final curve: position=[${segmentEndPos}], direction=${isFinalRightTurn ? "right" : "left"}`);
      curves.push(finalCurve);
      
      // Add final straight to connect exactly to start
      const finalCurveOutput = TrackMathUtils.calculateCurveEndPosition(
        finalCurve.position,
        newRotationY,
        curveRadius,
        90,
        isFinalRightTurn
      );
      
      const finalPos = finalCurveOutput.position;
      const directToStart = new THREE.Vector3().subVectors(startPosition, new THREE.Vector3(finalPos[0], 0, finalPos[2]));
      const finalDistance = Math.round(directToStart.length() * 10) / 10;
      
      if (finalDistance > 2) {
        // Calculate rotation to point toward start
        const finalRotationY = Math.atan2(
          startPosition.x - finalPos[0],
          startPosition.z - finalPos[2]
        );
        
        const finalStraight = {
          position: finalPos,
          rotation: [0, finalRotationY, 0],
          length: finalDistance,
          width: Math.round(trackWidth * 10) / 10,
          color: "#3b36e2",
          name: "Finish Line"
        };
        
        console.log(`Adding final connecting segment: position=[${finalPos}], length=${finalDistance}`);
        straights.push(finalStraight);
      }
    } else {
      // We're close enough to add a direct segment
      const finalRotationY = Math.atan2(
        startPosition.x - newPosition[0],
        startPosition.z - newPosition[2]
      );
      
      const finalStraight = {
        position: newPosition,
        rotation: [0, finalRotationY, 0],
        length: remainingDistance,
        width: Math.round(trackWidth * 10) / 10,
        color: "#3b36e2",
        name: "Finish Line"
      };
      
      console.log(`Adding final straight to close loop: position=[${newPosition}], length=${remainingDistance}`);
      straights.push(finalStraight);
    }
    
    console.log("Track loop closed successfully");
  }
};

export default TrackConnector; 