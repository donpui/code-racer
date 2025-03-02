import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import TrackGenerator from '../utils/track/TrackGenerator';
import '../styles/TrackBuilder.css';
import * as THREE from 'three';

// Track segment component
const TrackSegment = ({ position, rotation, scale, color, segment }) => {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[scale.x, scale.y, scale.z]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Track curve component for visualization (RENAMED to avoid conflict)
const TrackCurveViz = ({ position, rotation, complexity }) => {
  // Calculate curve parameters based on complexity
  const outerRadius = 5;
  const innerRadius = 5 - complexity / 3;  // Width varies by complexity
  const thickness = 0.2;  // Same thickness as straight segments
  
  return (
    <group position={position} rotation={rotation}>
      {/* Main curve surface */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <torusGeometry 
          args={[
            outerRadius,         // Outer radius
            (outerRadius - innerRadius) / 2,  // Tube radius (half of the track width)
            16,                  // Radial segments
            16,                  // Tubular segments
            Math.PI / 2          // Arc (quarter circle)
          ]} 
        />
        <meshStandardMaterial 
          color={complexity > 7 ? "#ff3d3d" : "#ffa500"} 
          roughness={0.6}
        />
      </mesh>
      
      {/* Curve base/ground */}
      <mesh position={[0, -thickness/2, 0]} rotation={[0, 0, 0]}>
        <ringGeometry 
          args={[
            innerRadius,     // Inner radius
            outerRadius,     // Outer radius
            16,              // Segments
            1,               // Segments theta
            0,               // Start angle
            Math.PI / 2      // End angle
          ]} 
        />
        <meshStandardMaterial 
          color="#1a1a2e" 
          roughness={0.8}
        />
      </mesh>
    </group>
  );
};

// Track visualization component
const TrackVisualization = ({ trackData }) => {
  return (
    <Canvas camera={{ position: [0, 20, 20], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      
      {/* Render track segments */}
      {trackData.segments.map((segment, index) => (
        <TrackSegment 
          key={`segment-${index}`}
          position={segment.position}
          rotation={segment.rotation}
          scale={segment.scale}
          color={segment.color}
          segment={segment}
        />
      ))}
      
      {/* Render track curves - USE UPDATED NAME HERE */}
      {trackData.curves.map((curve, index) => (
        <TrackCurveViz 
          key={`curve-${index}`}
          position={curve.position}
          rotation={curve.rotation}
          complexity={curve.complexity}
        />
      ))}
      
      {/* Start/finish line */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Ground */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#0a0a1a" />
      </mesh>
      
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </Canvas>
  );
};

// PLACE THESE COMPONENT DEFINITIONS HERE ONLY ONCE
// Move these to the top of the file, outside any other component
const TrackStraight = ({ length, width, position, rotation }) => {
  return (
    <mesh position={position} rotation={rotation} receiveShadow castShadow>
      <boxGeometry args={[width, 0.5, length]} />
      <meshStandardMaterial 
        color="#444466" 
        roughness={0.4}
        metalness={0.3} 
      />
      {/* Add lane markings */}
      <mesh position={[0, 0.26, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.3, 0.01, length * 0.8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </mesh>
  );
};

const TrackCurve = ({ radius, angle, width, position, rotation, direction, color }) => {
  // Create curve shape
  const curve = new THREE.Shape();
  const innerRadius = radius - width/2;
  const outerRadius = radius + width/2;
  const angleRad = angle * Math.PI / 180;
  
  // Calculate curve parameters
  const startAngle = direction === "right" ? -Math.PI/2 : -Math.PI/2;
  const endAngle = direction === "right" ? startAngle + angleRad : startAngle - angleRad;
  const clockwise = direction === "right" ? false : true;
  
  // Draw the curve shape
  curve.moveTo(innerRadius * Math.cos(startAngle), innerRadius * Math.sin(startAngle));
  curve.absarc(0, 0, innerRadius, startAngle, endAngle, clockwise);
  curve.lineTo(outerRadius * Math.cos(endAngle), outerRadius * Math.sin(endAngle));
  curve.absarc(0, 0, outerRadius, endAngle, startAngle, !clockwise);
  curve.closePath();
  
  const extrudeSettings = {
    steps: 1,
    depth: 0.5,
    bevelEnabled: false
  };
  
  // Use the passed color or fallback to a default
  const curveColor = color || (direction === "right" ? "#FFA500" : "#FFCC00");
  
  return (
    <group position={position} rotation={rotation}>
      {/* Main track surface - flat extruded shape */}
      <mesh receiveShadow castShadow rotation={[-Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[curve, extrudeSettings]} />
        <meshStandardMaterial 
          color={curveColor}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
      
      {/* Fix: Replace torus with flat line markers */}
      <mesh 
        position={[0, 0.26, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {/* Create a flat arc line instead of a torus */}
        <ringGeometry 
          args={[
            radius - 0.2, 
            radius + 0.2, 
            32, 
            1,
            startAngle,
            angleRad
          ]} 
        />
        <meshStandardMaterial color="#ff8844" emissive="#ff5511" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
};

const TrackJump = ({ length, height, width, position, rotation }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Ramp up */}
      <mesh position={[0, height/2, -length/4]} receiveShadow castShadow>
        <boxGeometry args={[width, height, length/2]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      {/* Ramp down */}
      <mesh position={[0, height/2, length/4]} receiveShadow castShadow>
        <boxGeometry args={[width, height, length/2]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
    </group>
  );
};

// MAIN COMPONENT - REMOVE ANY DUPLICATE TRACK COMPONENT DECLARATIONS IN HERE
const TrackBuilder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [trackData, setTrackData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Make sure we have analysis data
    if (!location.state) {
      navigate('/analyze');
      return;
    }
    
    try {
      // Initialize with empty arrays to prevent null errors
      const defaultTrackData = {
        straights: [],
        curves: [],
        jumps: [],
        boosts: [],
        obstacles: [],
        theme: {
          groundColor: "#121212",
          skyColor: "#050520",
          trackColor: "#333333",
          accentColor: "#7c3aed"
        },
        stats: {
          length: 0,
          complexity: 0,
          difficulty: "easy",
          turns: 0,
          straightSections: 0
        }
      };
      
      // Use pre-generated track data if available
      if (location.state.trackData) {
        console.log("Using pre-generated track data", location.state.trackData);
        // Merge with defaults to ensure all properties exist
        setTrackData({
          ...defaultTrackData,
          ...location.state.trackData
        });
      } 
      // Or generate it if we have analysis data
      else if (location.state.analysisData) {
        console.log("Generating track from analysis data", location.state.analysisData);
        const generatedTrackData = TrackGenerator.generateTrack(
          location.state.analysisData
        );
        
        // Debug log the generated track data
        console.log("========== TRACK DEBUG ==========");
        console.log("Generated Track Data:", generatedTrackData);
        console.log("Straights:", generatedTrackData.straights);
        console.log("Curves:", generatedTrackData.curves);
        console.log("Metadata:", generatedTrackData.metadata);
        
        // Transform the track data structure for the component
        // Map segments and curves from the generated data to the expected format
        const transformedTrackData = {
          straights: generatedTrackData.straights.map((segment, index) => {
            const transformedSegment = {
              id: `s-${index}`,
              length: segment.length,
              width: segment.width,
              position: segment.position,
              rotation: segment.rotation
            };
            console.log(`Straight segment ${index}:`, transformedSegment);
            return transformedSegment;
          }),
          curves: generatedTrackData.curves.map((curve, index) => {
            const transformedCurve = {
              id: `c-${index}`,
              radius: curve.radius || 15,  // Use provided radius or default
              angle: curve.angle || 90,    // Use provided angle or default
              width: curve.width || 10,    // Use provided width or default
              position: curve.position,
              rotation: curve.rotation,
              direction: curve.direction || "right",
              color: curve.color || (curve.direction === "right" ? "#FFA500" : "#FFCC00")
            };
            console.log(`Curve ${index}:`, transformedCurve);
            return transformedCurve;
          }),
          jumps: [],  // No jumps in the generated data
          stats: {
            length: generatedTrackData.metadata?.length || 0,
            complexity: generatedTrackData.metadata?.complexity || 0,
            difficulty: "medium",
            turns: generatedTrackData.metadata?.turns || 0
          }
        };
        
        console.log("Transformed Track Data:", transformedTrackData);
        console.log("========== END TRACK DEBUG ==========");
        
        setTrackData({
          ...defaultTrackData,
          ...transformedTrackData
        });
      } else {
        throw new Error("No track or analysis data provided");
      }
    } catch (err) {
      console.error("Error in TrackBuilder:", err);
      setError(`Failed to build track: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  }, [location.state, navigate]);

  const handleRaceClick = () => {
    navigate('/race', { state: { trackData } });
  };

  const handleView2D = () => {
    navigate('/track-2d', { state: { trackData } });
  };
  
  // Safe rendering - avoid null property access
  const renderTrack = () => {
    if (!trackData) return null;
    
    return (
      <>
        {/* Better looking ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[500, 500]} />
          <meshStandardMaterial color="#1a1a2a" />
        </mesh>
        
        {/* Grid helper for better visualization */}
        <gridHelper args={[100, 100, "#444", "#222"]} position={[0, 0.01, 0]} />
        
        {/* Rest of the track segments */}
        {Array.isArray(trackData.straights) && trackData.straights.map((straight, index) => (
          <TrackStraight 
            key={straight?.id || `straight-${index}`} 
            length={straight?.length || 20} 
            width={straight?.width || 10} 
            position={straight?.position || [0, 0, 0]} 
            rotation={straight?.rotation || [0, 0, 0]} 
          />
        ))}
        
        {Array.isArray(trackData.curves) && trackData.curves.map((curve, index) => (
          <TrackCurve 
            key={curve?.id || `curve-${index}`} 
            radius={curve?.radius || 15} 
            angle={curve?.angle || 90} 
            width={curve?.width || 10} 
            position={curve?.position || [0, 0, 0]} 
            rotation={curve?.rotation || [0, 0, 0]} 
            direction={curve?.direction || "right"} 
            color={curve?.color}
          />
        ))}
        
        {Array.isArray(trackData.jumps) && trackData.jumps.map((jump, index) => (
          <TrackJump 
            key={jump?.id || `jump-${index}`} 
            length={jump?.length || 15} 
            height={jump?.height || 5} 
            width={jump?.width || 10} 
            position={jump?.position || [0, 0, 0]} 
            rotation={jump?.rotation || [0, 0, 0]} 
          />
        ))}
      </>
    );
  };

  return (
    <div className="track-builder">
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => navigate('/analyze')}>Back to Analyzer</button>
        </div>
      )}
      
      {isGenerating ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Generating race track...</p>
        </div>
      ) : trackData ? (
        <>
          <div className="track-canvas">
            <Canvas 
              shadows 
              camera={{ position: [0, 30, 30], fov: 50 }} // Better camera position and narrower FOV
              gl={{ antialias: true }}
            >
              {/* Improved lighting setup */}
              <ambientLight intensity={0.7} /> {/* Brighter ambient light */}
              <directionalLight 
                position={[10, 20, 10]} 
                intensity={1.2} 
                castShadow 
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={50}
                shadow-camera-left={-30}
                shadow-camera-right={30}
                shadow-camera-top={30}
                shadow-camera-bottom={-30}
              />
              <directionalLight position={[-10, 15, -10]} intensity={0.8} color="#8080ff" />
              <pointLight position={[0, 10, 0]} intensity={0.8} color="#ff80ff" />
              
              <fog attach="fog" args={['#15152a', 50, 150]} /> {/* Subtle fog for depth */}
              
              <Stars radius={100} depth={50} count={3000} factor={4} fade />
              <OrbitControls 
                enableDamping 
                dampingFactor={0.05} 
                minDistance={10} 
                maxDistance={100}
              />
              {renderTrack()}
            </Canvas>
          </div>
          <div className="track-controls">
            <div className="track-info">
              <h2>Track Preview</h2>
              <div className="stats">
                <div className="stat">
                  <span>Length:</span> 
                  <span>{trackData.stats?.length || 'N/A'} units</span>
                </div>
                <div className="stat">
                  <span>Difficulty:</span> 
                  <span>{trackData.stats?.difficulty || 'Medium'}</span>
                </div>
                <div className="stat">
                  <span>Turns:</span> 
                  <span>{trackData.stats?.turns || (trackData.curves ? trackData.curves.length : 0)}</span>
                </div>
              </div>
            </div>
            <button 
              className="race-button" 
              onClick={handleRaceClick}
            >
              Start Racing
            </button>
            <button 
              className="back-button"
              onClick={() => navigate('/analyze')}
            >
              Back to Analyzer
            </button>
          </div>
        </>
      ) : (
        <div className="error-message">
          Failed to load track data
          <button onClick={() => navigate('/analyze')}>Back to Analyzer</button>
        </div>
      )}
    </div>
  );
};

export default TrackBuilder; 