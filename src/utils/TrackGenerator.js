import * as THREE from 'three';

/**
 * Utility class to generate 3D racing tracks based on GitHub repository analysis
 */
class TrackGenerator {
  /**
   * Generate a complete race track from repository analysis data
   * @param {Object} analysisData - Repository analysis data
   * @returns {Object} Track data for rendering
   */
  generateTrack(analysisData) {
    console.log("Starting track generation with analysis data:", analysisData);
    
    // Extract relevant metrics from analysis data
    const {
      fileCount,
      languages,
      complexity,
      contributorCount,
      dependencies,
      contents
    } = analysisData;
    
    // Track segments and curves collections
    const straights = [];
    const curves = [];
    
    // Track generation parameters
    const segmentCount = Math.min(Math.max(fileCount / 5, 10), 30);
    const curveFrequency = this.calculateCurveFrequency(complexity);
    const segmentLength = this.calculateSegmentLength(fileCount, complexity);
    const trackWidth = this.calculateTrackWidth(languages);
    
    console.log("Track generation parameters:", {
      segmentCount,
      curveFrequency,
      segmentLength,
      trackWidth
    });
    
    // Start position and direction
    let currentPosition = new THREE.Vector3(0, 0, 0);
    let currentDirection = new THREE.Vector3(0, 0, 1); // Initial direction: forward (z-axis)
    let currentRotationY = 0; // Track rotation around Y axis
    
    // Track curve direction history
    let consecutiveCurves = 0;
    let lastCurveDirection = null;
    
    // Create starting segment
    straights.push({
      position: [currentPosition.x, 0, currentPosition.z],
      rotation: [0, currentRotationY, 0],
      length: segmentLength,
      width: trackWidth,
      color: "#3b36e2"
    });
    
    console.log("Added starting segment at position:", [currentPosition.x, currentPosition.y, currentPosition.z]);
    
    // Update position for next segment
    currentPosition.addScaledVector(currentDirection, segmentLength);
    
    // Generate track segments and curves
    for (let i = 0; i < segmentCount; i++) {
      // Determine if this segment should have a curve
      const shouldCurve = Math.random() < curveFrequency;
      
      if (shouldCurve) {
        // Determine curve properties based on code metrics
        let isRightTurn = this.determineCurveDirection(i, contents, languages);
        
        // Enforce direction change after two consecutive curves in the same direction
        if (lastCurveDirection !== null) {
          if (lastCurveDirection === isRightTurn) {
            consecutiveCurves++;
            // If we've already had 2 curves in the same direction, force a change
            if (consecutiveCurves >= 2) {
              isRightTurn = !isRightTurn;
              consecutiveCurves = 0;
              console.log("Forced curve direction change after 2 consecutive same-direction curves");
            }
          } else {
            // Reset counter if direction changed
            consecutiveCurves = 0;
          }
        }
        
        lastCurveDirection = isRightTurn;
        
        // Use consistent curve radius and angle
        const curveRadius = trackWidth * 1.5;
        const curveAngle = 90; // 90-degree turn
        
        // Select curve color based on direction
        const curveColor = isRightTurn ? "#FFA500" : "#FFCC00"; // Orange for right turns, yellow for left
        
        console.log(`Adding curve: position=${currentPosition.toArray()}, direction=${isRightTurn ? "right" : "left"}, color=${curveColor}`);
        
        // Add curve to track with proper orientation and color
        curves.push({
          position: [currentPosition.x, 0, currentPosition.z],
          rotation: [0, currentRotationY, 0],
          radius: curveRadius,
          angle: curveAngle,
          width: trackWidth,
          direction: isRightTurn ? "right" : "left",
          color: curveColor // Add color property to curve objects
        });
        
        // Update direction and position based on curve
        if (isRightTurn) {
          currentRotationY -= Math.PI / 2; // Right turn is -90 degrees in Y
        } else {
          currentRotationY += Math.PI / 2; // Left turn is +90 degrees in Y
        }
        
        // Normalize rotation angle to keep it between 0 and 2π
        currentRotationY = currentRotationY % (Math.PI * 2);
        
        // Update current direction after the turn
        currentDirection = new THREE.Vector3(
          Math.sin(currentRotationY),
          0,
          Math.cos(currentRotationY)
        );
        
        // Calculate the end position of the curve precisely
        if (isRightTurn) {
          // For a right turn, move to the right and forward
          currentPosition.add(new THREE.Vector3(
            -curveRadius * (1 - Math.cos(Math.PI/2)), 
            0, 
            curveRadius * Math.sin(Math.PI/2)
          ).applyAxisAngle(new THREE.Vector3(0, 1, 0), currentRotationY + Math.PI/2));
        } else {
          // For a left turn, move to the left and forward
          currentPosition.add(new THREE.Vector3(
            curveRadius * (1 - Math.cos(Math.PI/2)), 
            0, 
            curveRadius * Math.sin(Math.PI/2)
          ).applyAxisAngle(new THREE.Vector3(0, 1, 0), currentRotationY - Math.PI/2));
        }
        
        console.log(`After curve: position=${currentPosition.toArray()}, rotation=${currentRotationY}, direction=${currentDirection.toArray()}`);
      }
      
      // Determine segment properties
      const segmentColor = this.getSegmentColor(i, languages);
      
      // Keep everything at y=0 for flat track
      currentPosition.y = 0;
      
      // Calculate segment length with slight variation
      const thisSegmentLength = segmentLength * (0.85 + Math.random() * 0.3);
      
      console.log(`Adding straight segment ${i} - Position: [${currentPosition.x.toFixed(2)}, ${currentPosition.y.toFixed(2)}, ${currentPosition.z.toFixed(2)}], Length: ${thisSegmentLength.toFixed(2)}`);
      
      // Add straight segment
      straights.push({
        position: [currentPosition.x, 0, currentPosition.z],
        rotation: [0, currentRotationY, 0],
        length: thisSegmentLength,
        width: trackWidth,
        color: segmentColor
      });
      
      // Update position for next segment
      currentPosition.addScaledVector(currentDirection, thisSegmentLength);
    }
    
    console.log("Track generation complete - Adding closing loop");
    console.log(`  Final position: [${currentPosition.x.toFixed(2)}, ${currentPosition.y.toFixed(2)}, ${currentPosition.z.toFixed(2)}]`);
    console.log(`  Final direction: [${currentDirection.x.toFixed(2)}, ${currentDirection.y.toFixed(2)}, ${currentDirection.z.toFixed(2)}]`);
    
    // Ensure track loops back to start
    this.closeTrackLoop(straights, curves, currentPosition, currentDirection, currentRotationY, trackWidth);
    
    // Generate obstacles based on code structure
    const obstacles = this.generateObstacles(analysisData, straights, curves);
    
    const trackData = {
      straights,
      curves,
      obstacles,
      metadata: {
        length: straights.reduce((sum, segment) => sum + segment.length, 0) + 
                curves.length * (trackWidth * Math.PI / 2),
        complexity: complexity.complexity,
        turns: curves.length,
        width: trackWidth
      }
    };
    
    console.log("Final track data:", {
      straightCount: straights.length,
      curveCount: curves.length,
      totalLength: trackData.metadata.length,
      turns: trackData.metadata.turns
    });
    
    return trackData;
  }
  
  /**
   * Calculate how often curves should appear
   * @param {Object} complexity - Code complexity metrics
   * @returns {number} Curve frequency (0-1)
   */
  calculateCurveFrequency(complexity) {
    // Higher complexity = more curves
    return 0.3 + (complexity.score / 30);
  }
  
  /**
   * Calculate segment length based on repository metrics
   * @param {number} fileCount - Number of files
   * @param {Object} complexity - Code complexity metrics
   * @returns {number} Segment length
   */
  calculateSegmentLength(fileCount, complexity) {
    // Base length adjusted by file count and complexity
    const baseLength = 10;
    const lengthFactor = Math.max(1, Math.min(fileCount / 100, 3));
    return baseLength * lengthFactor * (1 - complexity.score / 30); // Higher complexity = shorter segments
  }
  
  /**
   * Calculate track width based on language diversity
   * @param {Object} languages - Language breakdown
   * @returns {number} Track width
   */
  calculateTrackWidth(languages) {
    // More languages = wider track
    const languageCount = Object.keys(languages).length;
    const baseWidth = 3;
    return baseWidth + Math.min(languageCount / 3, 2);
  }
  
  /**
   * Determine curve direction based on code structure
   * @param {number} index - Segment index
   * @param {Array} contents - Repository contents
   * @param {Object} languages - Language breakdown
   * @returns {boolean} true for right turn, false for left turn
   */
  determineCurveDirection(index, contents, languages) {
    // Mix of deterministic and random elements
    if (contents && contents.length > 0) {
      // Use characteristics of content to determine direction
      const contentIndex = index % contents.length;
      const item = contents[contentIndex];
      
      // Based on content name length: even = right, odd = left
      if (item.name.length % 2 === 0) {
        return true;
      }
      
      // Based on content type
      if (item.type === 'dir') {
        return false;
      }
    }
    
    // Add some randomness
    return Math.random() > 0.5;
  }
  
  /**
   * Get segment color based on languages and position
   * @param {number} index - Segment index
   * @param {Object} languages - Language breakdown
   * @returns {string} Color hex value
   */
  getSegmentColor(index, languages) {
    // Create a color palette based on languages
    const colorPalette = [
      "#3b36e2", // JavaScript - blue
      "#7c3aed", // TypeScript - purple
      "#2dd4bf", // CSS - teal
      "#f97316", // HTML - orange
      "#ef4444"  // Other - red
    ];
    
    if (languages) {
      const langKeys = Object.keys(languages);
      if (langKeys.length > 0) {
        // Pick color based on dominant language and segment position
        const langIndex = index % langKeys.length;
        const dominance = languages[langKeys[langIndex]] / 100;
        
        // Shade the color based on language dominance
        if (dominance > 0.6) {
          // Brighter color for dominant languages
          return colorPalette[langIndex % colorPalette.length];
        } else if (dominance > 0.3) {
          // Use standard colors
          return index % 2 === 0 ? "#3b36e2" : "#7c3aed";
        }
      }
    }
    
    // Default alternating colors
    return index % 2 === 0 ? "#3b36e2" : "#7c3aed";
  }
  
  /**
   * Determine segment elevation based on code metrics
   * This now returns 0 always to keep the track flat
   */
  getSegmentElevation(index, complexity, contributorCount) {
    // Keep track flat - always return 0
    return 0;
  }
  
  /**
   * Connect the end of the track back to the start
   */
  closeTrackLoop(straights, curves, currentPosition, currentDirection, currentRotationY, trackWidth) {
    console.log("Closing track loop");
    
    // Calculate vector from current position to start
    const startPosition = new THREE.Vector3(0, 0, 0);
    const toStart = new THREE.Vector3().subVectors(startPosition, currentPosition);
    
    console.log("Closing track loop:", {
      currentPosition: currentPosition.toArray(),
      distanceToStart: toStart.length()
    });
    
    // For very close positions, connect directly
    if (toStart.length() < trackWidth * 2) {
      console.log("Direct connection to start - track is complete");
      return;
    }
    
    // Calculate angle between current direction and direction to start
    toStart.normalize();
    const dotProduct = currentDirection.dot(toStart);
    const angleToStart = Math.acos(Math.min(Math.max(dotProduct, -1), 1));
    
    // Determine if we need to turn right or left to face start point
    const cross = new THREE.Vector3().crossVectors(currentDirection, toStart);
    const isRightTurn = cross.y < 0;
    
    // First curve to turn toward start
    const curveRadius = trackWidth * 1.5;
    const firstCurveAngle = 90; // Simplified to 90-degree turns
    
    console.log(`Adding closing curve: position=${currentPosition.toArray()}, direction=${isRightTurn ? "right" : "left"}`);
    
    // Add first curve with color
    curves.push({
      position: [currentPosition.x, 0, currentPosition.z],
      rotation: [0, currentRotationY, 0],
      radius: curveRadius,
      angle: firstCurveAngle,
      width: trackWidth,
      direction: isRightTurn ? "right" : "left",
      color: isRightTurn ? "#FFA500" : "#FFCC00" // Orange for right turns, yellow for left
    });
    
    // Update direction and position after first curve
    if (isRightTurn) {
      currentRotationY -= Math.PI / 2;
    } else {
      currentRotationY += Math.PI / 2;
    }
    
    // Normalize rotation
    currentRotationY = currentRotationY % (Math.PI * 2);
    
    // Update direction vector
    currentDirection = new THREE.Vector3(
      Math.sin(currentRotationY),
      0,
      Math.cos(currentRotationY)
    );
    
    // Update position after the curve
    if (isRightTurn) {
      currentPosition.add(new THREE.Vector3(
        -curveRadius * (1 - Math.cos(Math.PI/2)), 
        0, 
        curveRadius * Math.sin(Math.PI/2)
      ).applyAxisAngle(new THREE.Vector3(0, 1, 0), currentRotationY + Math.PI/2));
    } else {
      currentPosition.add(new THREE.Vector3(
        curveRadius * (1 - Math.cos(Math.PI/2)), 
        0, 
        curveRadius * Math.sin(Math.PI/2)
      ).applyAxisAngle(new THREE.Vector3(0, 1, 0), currentRotationY - Math.PI/2));
    }
    
    // Now check if we need one more curve before connecting to start
    const remainingDistance = new THREE.Vector3().subVectors(startPosition, currentPosition).length();
    
    if (remainingDistance > trackWidth * 4) {
      // Add one more segment before the final curve
      const finalSegmentLength = Math.min(remainingDistance * 0.7, trackWidth * 6);
      
      console.log(`Adding closing straight: position=${currentPosition.toArray()}, length=${finalSegmentLength}`);
      
      // Add straight segment
      straights.push({
        position: [currentPosition.x, 0, currentPosition.z],
        rotation: [0, currentRotationY, 0],
        length: finalSegmentLength,
        width: trackWidth,
        color: "#3b36e2"
      });
      
      // Update position
      currentPosition.addScaledVector(currentDirection, finalSegmentLength);
      
      // Add final curve to connect to start
      const finalToStart = new THREE.Vector3().subVectors(startPosition, currentPosition);
      const finalDotProduct = currentDirection.dot(finalToStart.normalize());
      const finalCross = new THREE.Vector3().crossVectors(currentDirection, finalToStart.normalize());
      const isFinalRightTurn = finalCross.y < 0;
      
      console.log(`Adding final curve: position=${currentPosition.toArray()}, direction=${isFinalRightTurn ? "right" : "left"}`);
      
      // Add the final curve with color
      curves.push({
        position: [currentPosition.x, 0, currentPosition.z],
        rotation: [0, currentRotationY, 0],
        radius: curveRadius,
        angle: firstCurveAngle,
        width: trackWidth,
        direction: isFinalRightTurn ? "right" : "left",
        color: isFinalRightTurn ? "#FFA500" : "#FFCC00" // Orange for right turns, yellow for left
      });
    }
    
    console.log("Track loop closed successfully");
  }
  
  /**
   * Generate obstacles based on code metrics
   * @param {Object} analysisData - Repository analysis data
   * @param {Array} straights - Track straights
   * @param {Array} curves - Track curves
   * @returns {Array} Obstacles data
   */
  generateObstacles(analysisData, straights, curves) {
    // Placeholder for actual obstacle generation
    // In a full implementation, this would create obstacles based on:
    // - Code issues and bugs (from GitHub issues)
    // - File sizes (larger files = bigger obstacles)
    // - Code complexity (more complex = more obstacles)
    return [];
  }
}

export default new TrackGenerator(); 