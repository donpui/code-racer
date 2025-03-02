/**
 * Functions for calculating track parameters based on repository analysis
 */
export const TrackParameters = {
  /**
   * Calculate how often curves should appear
   */
  calculateCurveFrequency(complexity) {
    // Higher complexity = more curves
    return 0.3 + (complexity.score / 30);
  },
  
  /**
   * Calculate segment length based on repository metrics
   */
  calculateSegmentLength(fileCount, complexity) {
    // Base length adjusted by file count and complexity
    const baseLength = 10;
    const lengthFactor = Math.max(1, Math.min(fileCount / 100, 3));
    const calculatedLength = baseLength * lengthFactor * (1 - complexity.score / 30);
    
    // Return integer length (minimum 10 units)
    return Math.max(10, Math.round(calculatedLength));
  },
  
  /**
   * Calculate track width based on language diversity
   */
  calculateTrackWidth(languages) {
    // More languages = wider track
    const languageCount = Object.keys(languages).length;
    const baseWidth = 3;
    const calculatedWidth = baseWidth + Math.min(languageCount / 3, 2);
    
    // Return integer width (minimum 3 units)
    return Math.max(3, Math.round(calculatedWidth));
  },
  
  /**
   * Determine curve direction based on code structure
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
    
  },
  
  /**
   * Get segment color based on languages and position
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
};

export default TrackParameters; 