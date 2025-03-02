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
    
    // Track generation parameters - strictly integer values
    const segmentCount = Math.min(Math.max(Math.round(fileCount / 5), 10), 25);
    const curveFrequency = TrackParameters.calculateCurveFrequency(complexity);
    const segmentLength = Math.round(TrackParameters.calculateSegmentLength(fileCount, complexity));
    const trackWidth = Math.round(TrackParameters.calculateTrackWidth(languages));
    
    console.log("Track generation parameters:", {
      segmentCount,
      curveFrequency,
      segmentLength,
      trackWidth
    });
    
    // Start position and direction - using strict integer coordinates
    let currentPosition = [0, 0, 0];
    let currentDirection = [0, 0, 1]; // Initial direction: forward (z-axis)
    let currentRotationY = 0; // Track rotation around Y axis
    
    // Track curve direction history
    let consecutiveCurves = 0;
    let lastCurveDirection = null;
    
    // Create starting segment - fixed integer length
    const startingSegment = TrackSegmentFactory.createSegment({
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      length: segmentLength,
      width: trackWidth, 
      color: "#3b36e2",
      name: "Start"
    });
    
    straights.push(startingSegment);
    console.log("Added starting segment at position:", [0, 0, 0], "with length:", segmentLength);
    
    // Update position for next segment - exact integer position
    currentPosition = [0, 0, segmentLength];
    
    // Generate track segments and curves
    for (let i = 0; i < segmentCount; i++) {
      // Determine if this segment should have a curve
      const shouldCurve = Math.random() < curveFrequency;
      
      if (shouldCurve) {
        // Determine curve properties based on code metrics
        let isRightTurn = TrackParameters.determineCurveDirection(i, contents, languages);
        
        // Enforce direction change after two consecutive curves in the same direction
        if (lastCurveDirection !== null) {
          if (lastCurveDirection === isRightTurn) {
            consecutiveCurves++;
            if (consecutiveCurves >= 2) {
              isRightTurn = !isRightTurn;
              consecutiveCurves = 0;
              console.log("Forced curve direction change after 2 consecutive same-direction curves");
            }
          } else {
            consecutiveCurves = 0;
          }
        }
        
        lastCurveDirection = isRightTurn;
        
        // Integer curve radius (no fractional values)
        const curveRadius = Math.round(trackWidth * 1.5);
        
        // Create curve with integer positions
        const curve = TrackCurveFactory.createCurve({
          position: TrackMathUtils.roundPosition(currentPosition),
          rotation: [0, currentRotationY, 0],
          radius: curveRadius,
          angle: 90, // Fixed 90-degree turns
          width: trackWidth,
          direction: isRightTurn ? "right" : "left",
          color: isRightTurn ? "#FFA500" : "#FFCC00",
          name: `Curve ${curves.length + 1}`
        });
        
        console.log(`Adding curve: position=[${curve.position}], direction=${isRightTurn ? "right" : "left"}`);
        curves.push(curve);
        
        // Calculate new position, rotation and direction after the curve - with integer output
        const curveOutput = TrackMathUtils.calculateCurveEndPosition(
          curve.position, 
          currentRotationY, 
          curveRadius, 
          90, 
          isRightTurn
        );
        
        currentPosition = curveOutput.position;
        currentRotationY = curveOutput.rotationY;
        currentDirection = curveOutput.direction;
        
        console.log(`After curve: position=[${currentPosition}], direction=[${currentDirection}]`);
      }
      
      // Determine segment properties
      const segmentColor = TrackParameters.getSegmentColor(i, languages);
      
      // Calculate segment length as integer - using fixed larger values
      // Instead of a small random factor, use fixed segment sizes of 10-20 units
      const lengthOptions = [10, 12, 14, 16, 18, 20];
      const thisSegmentLength = lengthOptions[Math.floor(Math.random() * lengthOptions.length)];
      
      console.log(`Adding straight segment ${i}: position=[${currentPosition}], length=${thisSegmentLength}`);
      
      // Create straight segment with integer positions
      const segment = TrackSegmentFactory.createSegment({
        position: TrackMathUtils.roundPosition(currentPosition),
        rotation: [0, currentRotationY, 0],
        length: thisSegmentLength,
        width: trackWidth,
        color: segmentColor,
        name: `Segment ${straights.length}`
      });
      
      straights.push(segment);
      
      // Calculate next position using integer math
      currentPosition = TrackMathUtils.calculateSegmentEndPosition(
        segment.position,
        currentDirection,
        thisSegmentLength
      );
    }
    
    console.log("Track generation complete - Adding closing loop");
    console.log(`Final position: [${currentPosition}]`);
    console.log(`Final direction: [${currentDirection}]`);
    
    // Close the track with integer precision
    TrackConnector.closeTrackLoop(
      straights, 
      curves, 
      currentPosition, 
      currentDirection, 
      currentRotationY, 
      trackWidth
    );
    
    // Empty obstacles array
    const obstacles = [];
    
    // Create track data with integer metadata
    const trackData = {
      straights,
      curves,
      obstacles,
      metadata: {
        length: Math.round(straights.reduce((sum, segment) => sum + segment.length, 0) + 
                curves.length * (trackWidth * Math.PI / 2)),
        complexity: complexity.complexity,
        turns: curves.length,
        width: trackWidth
      }
    };
    
    // Verify all positions are integers before returning
    this.verifyIntegerTrackData(trackData);
    
    console.log("Final track data:", {
      straightCount: straights.length,
      curveCount: curves.length,
      totalLength: trackData.metadata.length,
      turns: trackData.metadata.turns
    });
    
    return trackData;
  }
  
  /**
   * Verify all position and dimension values are integers
   */
  verifyIntegerTrackData(trackData) {
    // Ensure all straight segments have integer positions and dimensions
    trackData.straights.forEach(segment => {
      segment.position = segment.position.map(val => typeof val === 'number' ? Math.round(val) : val);
      segment.length = Math.round(segment.length);
      segment.width = Math.round(segment.width);
    });
    
    // Ensure all curves have integer positions and dimensions
    trackData.curves.forEach(curve => {
      curve.position = curve.position.map(val => typeof val === 'number' ? Math.round(val) : val);
      curve.radius = Math.round(curve.radius);
      curve.width = Math.round(curve.width);
    });
  }
}

// Export a singleton instance instead of the class
export default new TrackGenerator(); 