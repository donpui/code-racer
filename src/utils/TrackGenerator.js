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
    const segments = [];
    const curves = [];
    
    // Track generation parameters
    const segmentCount = Math.min(Math.max(fileCount / 5, 10), 30);
    const curveFrequency = this.calculateCurveFrequency(complexity);
    const segmentLength = this.calculateSegmentLength(fileCount, complexity);
    const trackWidth = this.calculateTrackWidth(languages);
    
    // Start position and direction
    let currentPosition = [0, 0, 0];
    let currentRotation = [0, 0, 0];
    let currentDirection = [0, 0, 1]; // Initial direction: forward (z-axis)
    
    // Create starting segment
    segments.push({
      position: [...currentPosition],
      rotation: [...currentRotation],
      scale: { x: trackWidth, y: 0.2, z: segmentLength },
      color: "#3b36e2"
    });
    
    // Update position for next segment
    currentPosition = [
      currentPosition[0] + currentDirection[0] * segmentLength,
      currentPosition[1],
      currentPosition[2] + currentDirection[2] * segmentLength
    ];
    
    // Generate track segments and curves
    for (let i = 0; i < segmentCount; i++) {
      // Determine if this segment should have a curve
      const shouldCurve = Math.random() < curveFrequency;
      
      if (shouldCurve) {
        // Determine curve properties based on code metrics
        const isRightTurn = this.determineCurveDirection(i, contents, languages);
        const curveComplexity = this.determineCurveComplexity(complexity, dependencies);
        
        // Add curve to track
        curves.push({
          position: [...currentPosition],
          rotation: [0, isRightTurn ? 0 : Math.PI, 0],
          complexity: curveComplexity
        });
        
        // Update direction based on curve
        if (isRightTurn) {
          currentDirection = [currentDirection[2], 0, -currentDirection[0]];
        } else {
          currentDirection = [-currentDirection[2], 0, currentDirection[0]];
        }
        
        // Update rotation
        currentRotation = [0, isRightTurn ? Math.PI / 2 : -Math.PI / 2, 0];
        
        // Move position after curve
        currentPosition = [
          currentPosition[0] + currentDirection[0] * (trackWidth * 2),
          currentPosition[1],
          currentPosition[2] + currentDirection[2] * (trackWidth * 2)
        ];
      }
      
      // Determine segment properties
      const segmentColor = this.getSegmentColor(i, languages);
      const segmentElevation = this.getSegmentElevation(i, complexity, contributorCount);
      
      // Adjust current position for elevation
      currentPosition[1] = segmentElevation;
      
      // Add straight segment
      segments.push({
        position: [...currentPosition],
        rotation: [...currentRotation],
        scale: { 
          x: trackWidth, 
          y: 0.2, 
          z: segmentLength + (Math.random() * segmentLength * 0.3)
        },
        color: segmentColor
      });
      
      // Update position for next segment
      currentPosition = [
        currentPosition[0] + currentDirection[0] * segmentLength,
        currentPosition[1],
        currentPosition[2] + currentDirection[2] * segmentLength
      ];
    }
    
    // Ensure track loops back to start
    this.closeTrackLoop(segments, curves, currentPosition, currentDirection);
    
    // Generate obstacles based on code structure
    const obstacles = this.generateObstacles(analysisData, segments, curves);
    
    return {
      segments,
      curves,
      obstacles,
      metadata: {
        length: segments.length * segmentLength + curves.length * (trackWidth * 2),
        complexity: complexity.complexity,
        turns: curves.length,
        width: trackWidth
      }
    };
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
   * Determine curve complexity based on code metrics
   * @param {Object} complexity - Code complexity metrics
   * @param {number} dependencies - Dependency count
   * @returns {number} Curve complexity (1-10)
   */
  determineCurveComplexity(complexity, dependencies) {
    // Mix of complexity metrics and dependencies
    const baseComplexity = Math.max(1, Math.min(complexity.score, 10));
    const dependencyFactor = Math.min(dependencies / 20, 1);
    
    return baseComplexity * (1 + dependencyFactor * 0.5);
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
   * @param {number} index - Segment index
   * @param {Object} complexity - Code complexity metrics
   * @param {number} contributorCount - Number of contributors
   * @returns {number} Elevation value
   */
  getSegmentElevation(index, complexity, contributorCount) {
    // Create hills and valleys based on complexity and contributors
    const baseElevation = 0;
    
    // Use sine waves with different frequencies to create terrain
    const complexityFactor = complexity.score / 10;
    const contributorFactor = Math.min(contributorCount / 20, 1);
    
    const elevation = 
      Math.sin(index * 0.2 * complexityFactor) * 1.5 + 
      Math.cos(index * 0.5 * contributorFactor) * 0.8;
    
    return baseElevation + elevation;
  }
  
  /**
   * Ensure track loops back to the start
   * @param {Array} segments - Track segments
   * @param {Array} curves - Track curves
   * @param {Array} currentPosition - Current position
   * @param {Array} currentDirection - Current direction
   */
  closeTrackLoop(segments, curves, currentPosition, currentDirection) {
    // Calculate vector to starting point
    const target = [0, 0, 0];
    const toStart = [
      target[0] - currentPosition[0],
      0,
      target[2] - currentPosition[2]
    ];
    
    // Normalize the vector
    const distance = Math.sqrt(toStart[0] * toStart[0] + toStart[2] * toStart[2]);
    
    // If we're already close to the start, just add a final segment
    if (distance < 15) {
      segments.push({
        position: [
          currentPosition[0] / 2, 
          0, 
          currentPosition[2] / 2
        ],
        rotation: [0, Math.atan2(currentDirection[0], currentDirection[2]), 0],
        scale: { x: 3, y: 0.2, z: distance },
        color: "#3b36e2"
      });
      return;
    }
    
    const normalized = [toStart[0] / distance, 0, toStart[2] / distance];
    
    // Calculate dot product to find angle
    const dotProduct = currentDirection[0] * normalized[0] + currentDirection[2] * normalized[2];
    const angle = Math.acos(Math.min(Math.max(dotProduct, -1), 1));
    
    // Determine if we need to turn right or left
    const crossProduct = currentDirection[0] * normalized[2] - currentDirection[2] * normalized[0];
    const isRightTurn = crossProduct < 0;
    
    // Add a curve to turn toward the start
    curves.push({
      position: [...currentPosition],
      rotation: [0, isRightTurn ? -Math.PI / 2 : 0, 0],
      complexity: 5
    });
    
    // Update direction after curve
    let newDirection;
    if (isRightTurn) {
      newDirection = [currentDirection[2], 0, -currentDirection[0]];
    } else {
      newDirection = [-currentDirection[2], 0, currentDirection[0]];
    }
    
    // Calculate new position after the curve
    const curveEndPosition = [
      currentPosition[0] + newDirection[0] * 5,
      currentPosition[1],
      currentPosition[2] + newDirection[2] * 5
    ];
    
    // Add one more segment to get closer to start
    segments.push({
      position: [
        curveEndPosition[0] + (normalized[0] * distance * 0.5),
        0,
        curveEndPosition[2] + (normalized[2] * distance * 0.5)
      ],
      rotation: [0, Math.atan2(normalized[0], normalized[2]), 0],
      scale: { x: 3, y: 0.2, z: distance * 0.7 },
      color: "#3b36e2"
    });
    
    // Add final connector to start
    segments.push({
      position: [2.5, 0, 5],
      rotation: [0, Math.PI, 0],
      scale: { x: 3, y: 0.2, z: 5 },
      color: "#3b36e2"
    });
  }
  
  /**
   * Generate obstacles based on code metrics
   * @param {Object} analysisData - Repository analysis data
   * @param {Array} segments - Track segments
   * @param {Array} curves - Track curves
   * @returns {Array} Obstacles data
   */
  generateObstacles(analysisData, segments, curves) {
    // Placeholder for actual obstacle generation
    // In a full implementation, this would create obstacles based on:
    // - Code issues and bugs (from GitHub issues)
    // - File sizes (larger files = bigger obstacles)
    // - Code complexity (more complex = more obstacles)
    return [];
  }
}

export default new TrackGenerator(); 