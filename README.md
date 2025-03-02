# Code Racer 🏎️

Code Racer is an interactive 3D racing game that analyzes GitHub repositories and transforms them into unique race tracks. Race through the architecture of code and experience your favorite repositories in a whole new way!

## Features

- **GitHub Repository Analysis**: Analyze any public GitHub repository to extract code metrics, structure, and relationships
- **Procedural Track Generation**: Generate unique racing tracks based on code complexity, file structure, and language distribution
- **3D Racing Experience**: Drive a high-speed vehicle through your code-generated track with realistic physics
- **Code Visualization**: Experience the structure of code in a tangible, visual way

## How It Works

1. **Analyze**: Enter a GitHub repository URL to analyze its structure, metrics, and relationships
2. **Generate**: The app transforms the code analysis into a unique race track with features based on code characteristics:
   - Code complexity determines track curve difficulty
   - File size influences track segment length
   - Language distribution affects track width and color
   - Dependencies create track intersections and obstacles
3. **Race**: Drive your vehicle through the generated track with intuitive controls

## Code-to-Track Mapping

- **File Size**: Larger files create longer straight sections
- **Code Complexity**: Complex code creates sharper turns and obstacles
- **Dependencies**: More dependencies create more intersections and track features
- **Languages**: Each programming language has a distinct color on the track
- **Contributors**: More contributors create elevation changes (hills and valleys)
- **Issues/Bugs**: Create obstacles and hazards on the track

## Technologies

- **Frontend**: React.js for the UI
- **3D Rendering**: Three.js with React Three Fiber
- **GitHub Integration**: GitHub API for repository analysis
- **Physics**: Custom physics implementation for racing mechanics

## Getting Started

### Prerequisites

- Node.js 14+ and npm

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/code-racer.git
   cd code-racer
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and visit `http://localhost:3000`

## Controls

- **W / ↑**: Accelerate
- **S / ↓**: Brake/Reverse
- **A / ←**: Turn Left
- **D / →**: Turn Right
- **Space**: Handbrake

## Future Enhancements

- **Multiplayer Racing**: Race against others on the same code track
- **Leaderboards**: Track best lap times for each repository
- **Advanced Track Features**: More sophisticated code-to-track mapping
- **Repository Comparisons**: Race on tracks generated from different versions of the same codebase
- **Code Health Indicators**: Visual indicators of code quality on the track

## License

MIT

## Acknowledgements

- This project was inspired by the intersection of coding and gaming
- Special thanks to the Three.js and React communities for their excellent libraries

---

Made with ❤️ for coders who love racing games 

Idea by Donatas