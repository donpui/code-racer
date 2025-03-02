/**
 * Pre-analyzed repository data for Code Racer
 * This data eliminates the need for GitHub API calls when using demo repositories
 */
export const demoRepositories = {
  "donpui/winden": {
    id: "winden",
    name: "Winden - Magic Wormhole Web Application",
    url: "https://github.com/donpui/winden",
    description: "A free web application for secure, fast, and easy file transfers between devices in real-time",
    stars: 248,
    forks: 4,
    issueCount: 15,
    size: 8750,
    languages: {
      TypeScript: 88.7,
      Rust: 4.6,
      HTML: 3.6,
      JavaScript: 2.4,
      Other: 0.7
    },
    // Track generation metrics
    fileCount: 156,
    directoryCount: 24,
    averageFileSize: 14320,
    maxDepth: 6,
    complexity: 75,
    contributorCount: 12,
    
    // File structure for visualization
    rootDirectories: [
      { name: ".github", size: 1240, type: "directory", children: 3 },
      { name: ".husky", size: 870, type: "directory", children: 4 },
      { name: "client", size: 42500, type: "directory", children: 47 },
      { name: "client-e2e", size: 3450, type: "directory", children: 14 },
      { name: "doc", size: 5750, type: "directory", children: 8 },
      { name: "feedback-api", size: 12780, type: "directory", children: 18 }
    ],
    
    // Most significant files for track features
    significantFiles: [
      { name: "client/src/app/wormhole/wormhole.ts", size: 2450, type: "code", importance: 95 },
      { name: "client/src/app/components/FileTransfer.tsx", size: 1870, type: "code", importance: 90 },
      { name: "client/src/app/crypto/encryption.ts", size: 1620, type: "code", importance: 85 },
      { name: "feedback-api/src/main.rs", size: 3240, type: "code", importance: 80 },
      { name: "client/src/app/components/CodeInput.tsx", size: 1240, type: "code", importance: 75 }
    ],
    
    // Explicitly provide empty arrays for all track segment types
    trackData: {
      straights: [
        { id: 's1', length: 25, width: 10, position: [0, 0, 0], rotation: [0, 0, 0], features: ["TypeScript"] },
        { id: 's2', length: 20, width: 10, position: [0, 0, -30], rotation: [0, 0, 0], features: ["React Component"] },
        { id: 's3', length: 30, width: 10, position: [30, 0, -50], rotation: [0, Math.PI/2, 0], features: ["Encryption"] },
        { id: 's4', length: 15, width: 10, position: [65, 0, -50], rotation: [0, Math.PI/2, 0], features: ["HTML"] },
        { id: 's5', length: 18, width: 10, position: [65, 0, -20], rotation: [0, 0, 0], features: ["Docker"] }
      ],
      curves: [
        { id: 'c1', angle: 90, radius: 20, width: 10, position: [0, 0, -50], rotation: [0, -Math.PI/2, 0], direction: "right", features: ["API"] },
        { id: 'c2', angle: 90, radius: 15, width: 10, position: [30, 0, -20], rotation: [0, Math.PI, 0], direction: "left", features: ["Testing"] },
        { id: 'c3', angle: 90, radius: 25, width: 10, position: [85, 0, -50], rotation: [0, Math.PI/2, 0], direction: "right", features: ["WebSockets"] }
      ],
      jumps: [
        { id: 'j1', length: 10, height: 5, width: 10, position: [85, 0, -10], rotation: [0, 0, 0], features: ["Security"] }
      ],
      boosts: [
        { id: 'b1', length: 15, width: 10, position: [60, 0, -30], rotation: [0, Math.PI/2, 0], features: ["Performance"] }
      ],
      obstacles: [
        { id: 'o1', width: 5, height: 3, position: [40, 0, -50], rotation: [0, 0, 0], features: ["Bug"] }
      ],
      // Track metadata
      theme: {
        groundColor: "#121212",
        skyColor: "#050520",
        trackColor: "#333333",
        accentColor: "#7c3aed",
        lightIntensity: 0.8
      },
      stats: {
        length: 230,
        complexity: 75,
        difficulty: "medium",
        turns: 3,
        straightSections: 5
      },
      // Starting position
      startPosition: [0, 0.5, 10],
      startRotation: [0, 0, 0]
    }
  }
  // You can add more demo repositories here as needed
};

/**
 * Get repository data by GitHub URL or repo name
 * @param {string} repoUrl - GitHub repository URL or name (e.g., "donpui/winden")
 * @returns {Object|null} - Repository data or null if not found
 */
export const getDemoRepoData = (repoUrl) => {
  // Extract repo identifier from URL
  let repoIdentifier = repoUrl;
  
  // Handle full GitHub URLs
  if (repoUrl.includes('github.com')) {
    const urlParts = repoUrl.split('github.com/');
    if (urlParts.length > 1) {
      repoIdentifier = urlParts[1].replace(/\/$/, ''); // Remove trailing slash if present
    }
  }
  
  // Direct lookup in our demo repositories object
  return demoRepositories[repoIdentifier] || null;
}; 