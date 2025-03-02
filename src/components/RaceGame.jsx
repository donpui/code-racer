import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useKeyboardControls, Text, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import '../styles/RaceGame.css';

// Car component
const Car = ({ position, rotation, carRef, cameraRef }) => {
  // Define car mesh with improved details
  // Animate wheel rotation based on speed
  const wheelRotation = useRef(0);
  
  useFrame((state, delta) => {
    // Animate wheels when car is moving
    if (carRef.current && wheelRotation.current !== undefined) {
      wheelRotation.current += delta * 5;
    }
  });
  
  return (
    <group ref={carRef} position={position} rotation={rotation}>
      {/* Main car body - lower part */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[2, 0.4, 4.5]} />
        <meshPhysicalMaterial 
          color="#ff0066" 
          metalness={0.9} 
          roughness={0.1} 
          clearcoat={1.0} 
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      {/* Sleek upper body */}
      <mesh position={[0, 0.7, 0.3]} castShadow>
        <boxGeometry args={[1.8, 0.2, 3]} />
        <meshPhysicalMaterial 
          color="#ff0066" 
          metalness={0.9} 
          roughness={0.1} 
          clearcoat={1.0} 
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      {/* Hood slant */}
      <mesh position={[0, 0.5, 1.9]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[1.7, 0.1, 0.8]} />
        <meshPhysicalMaterial 
          color="#ff0066" 
          metalness={0.9} 
          roughness={0.1} 
          clearcoat={1.0} 
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      {/* Car cockpit - windshield */}
      <mesh position={[0, 0.95, 0.2]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[1.7, 0.6, 1.5]} />
        <meshPhysicalMaterial 
          color="#111122" 
          metalness={0.1} 
          roughness={0.1} 
          transmission={0.9} 
          transparent={true}
          opacity={0.7}
        />
      </mesh>
      
      {/* Rear spoiler */}
      <mesh position={[0, 1.1, -1.8]} castShadow>
        <boxGeometry args={[1.8, 0.1, 0.3]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Spoiler supports */}
      <mesh position={[0.7, 0.9, -1.8]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.2]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.7, 0.9, -1.8]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.2]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Front bumper */}
      <mesh position={[0, 0.3, 2.2]} castShadow>
        <boxGeometry args={[2, 0.3, 0.2]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Rear bumper */}
      <mesh position={[0, 0.3, -2.2]} castShadow>
        <boxGeometry args={[2, 0.3, 0.2]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Side skirts */}
      <mesh position={[1.05, 0.25, 0]} castShadow>
        <boxGeometry args={[0.1, 0.2, 4]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-1.05, 0.25, 0]} castShadow>
        <boxGeometry args={[0.1, 0.2, 4]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Wheels with rims */}
      <group position={[1.05, 0.4, 1.5]} rotation={[wheelRotation.current, Math.PI/2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
        {/* Rim */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.31, 8]} />
          <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      
      <group position={[-1.05, 0.4, 1.5]} rotation={[wheelRotation.current, Math.PI/2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
        {/* Rim */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.31, 8]} />
          <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      
      <group position={[1.05, 0.4, -1.5]} rotation={[wheelRotation.current, Math.PI/2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
        {/* Rim */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.31, 8]} />
          <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      
      <group position={[-1.05, 0.4, -1.5]} rotation={[wheelRotation.current, Math.PI/2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
        {/* Rim */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.31, 8]} />
          <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      
      {/* Headlights */}
      <mesh position={[0.7, 0.5, 2.15]} castShadow>
        <sphereGeometry args={[0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#fffa66" emissive="#fffa66" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.7, 0.5, 2.15]} castShadow>
        <sphereGeometry args={[0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#fffa66" emissive="#fffa66" emissiveIntensity={2} />
      </mesh>
      
      {/* Taillights */}
      <mesh position={[0.7, 0.5, -2.15]} castShadow>
        <sphereGeometry args={[0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} rotation={[0, Math.PI, 0]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[-0.7, 0.5, -2.15]} castShadow>
        <sphereGeometry args={[0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} rotation={[0, Math.PI, 0]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1.5} />
      </mesh>
      
      {/* Camera anchor point for third-person view */}
      <object3D ref={cameraRef} position={[0, 3, -8]} />
    </group>
  );
};

// Track segment component (reused from TrackBuilder)
const TrackSegment = ({ position, rotation, scale, color }) => {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[scale.x, scale.y, scale.z]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Track curve component (reused from TrackBuilder)
const TrackCurve = ({ position, rotation, complexity }) => {
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

// Game scene component
const GameScene = ({ trackData }) => {
  const carRef = useRef();
  const cameraRef = useRef();
  const cameraPositionRef = useRef(new THREE.Vector3(0, 10, 10));
  const cameraLookAtRef = useRef(new THREE.Vector3(0, 0, 0));
  
  // Game state
  const [speed, setSpeed] = useState(0);
  const [maxSpeed] = useState(0.5);
  const [acceleration] = useState(0.01);
  const [deceleration] = useState(0.005);
  const [turnSpeed] = useState(0.03);
  const [isGameOver, setIsGameOver] = useState(false);
  const [lap, setLap] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [bestLapTime, setBestLapTime] = useState(null);
  const [lastCheckpointTime, setLastCheckpointTime] = useState(0);
  
  // Keyboard controls
  const [controls, setControls] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false
  });
  
  // Set up keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          setControls(prev => ({ ...prev, forward: true }));
          break;
        case 'arrowdown':
        case 's':
          setControls(prev => ({ ...prev, backward: true }));
          break;
        case 'arrowleft':
        case 'a':
          setControls(prev => ({ ...prev, left: true }));
          break;
        case 'arrowright':
        case 'd':
          setControls(prev => ({ ...prev, right: true }));
          break;
        case ' ':
          setControls(prev => ({ ...prev, brake: true }));
          break;
        default:
          break;
      }
    };
    
    const handleKeyUp = (e) => {
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          setControls(prev => ({ ...prev, forward: false }));
          break;
        case 'arrowdown':
        case 's':
          setControls(prev => ({ ...prev, backward: false }));
          break;
        case 'arrowleft':
        case 'a':
          setControls(prev => ({ ...prev, left: false }));
          break;
        case 'arrowright':
        case 'd':
          setControls(prev => ({ ...prev, right: false }));
          break;
        case ' ':
          setControls(prev => ({ ...prev, brake: false }));
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Game update loop
  useFrame((state, delta) => {
    if (!carRef.current || isGameOver) return;
    
    // Update elapsed time
    setTimeElapsed(prev => prev + delta);
    
    // Handle car movement
    const car = carRef.current;
    
    // Apply acceleration/deceleration
    if (controls.forward) {
      setSpeed(prev => Math.min(prev + acceleration, maxSpeed));
    } else if (controls.backward) {
      setSpeed(prev => Math.max(prev - acceleration, -maxSpeed / 2));
    } else {
      // Natural deceleration
      setSpeed(prev => {
        if (prev > 0) {
          return Math.max(prev - deceleration, 0);
        } else if (prev < 0) {
          return Math.min(prev + deceleration, 0);
        }
        return 0;
      });
    }
    
    // Apply brakes
    if (controls.brake) {
      setSpeed(prev => {
        if (prev > 0) {
          return Math.max(prev - deceleration * 3, 0);
        } else if (prev < 0) {
          return Math.min(prev + deceleration * 3, 0);
        }
        return 0;
      });
    }
    
    // Calculate forward direction based on car's rotation
    const forwardDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(car.quaternion);
    
    // Apply movement
    car.position.add(forwardDirection.multiplyScalar(speed));
    
    // Apply turning (only when moving)
    if (Math.abs(speed) > 0.05) {
      if (controls.left) {
        car.rotation.y += turnSpeed * (speed > 0 ? 1 : -1);
      }
      if (controls.right) {
        car.rotation.y -= turnSpeed * (speed > 0 ? 1 : -1);
      }
    }
    
    // Update camera to follow car
    if (cameraRef.current) {
      const cameraIdealPosition = new THREE.Vector3().copy(cameraRef.current.getWorldPosition(new THREE.Vector3()));
      
      // Smoothly interpolate camera position
      cameraPositionRef.current.lerp(cameraIdealPosition, 0.05);
      state.camera.position.copy(cameraPositionRef.current);
      
      // Make camera look at car
      cameraLookAtRef.current.lerp(car.position, 0.05);
      state.camera.lookAt(cameraLookAtRef.current);
    }
    
    // Check for lap completion (crossing start/finish line)
    if (car.position.distanceTo(new THREE.Vector3(0, 0, 0)) < 5 && 
        car.position.z > 0 && 
        timeElapsed - lastCheckpointTime > 20) {
      
      const lapTime = timeElapsed - lastCheckpointTime;
      setLastCheckpointTime(timeElapsed);
      
      if (lap > 0) {
        // Not the first crossing
        if (!bestLapTime || lapTime < bestLapTime) {
          setBestLapTime(lapTime);
        }
      }
      
      setLap(prev => prev + 1);
    }
    
    // Very basic collision detection
    // Detect if car is too far from track (simplified)
    const farFromTrack = !trackData.segments.some(segment => {
      const segmentPos = new THREE.Vector3(...segment.position);
      return car.position.distanceTo(segmentPos) < 20;
    });
    
    if (farFromTrack) {
      // Reset car position if it falls off track
      car.position.set(0, 0.5, 0);
      car.rotation.set(0, 0, 0);
      setSpeed(0);
    }
  });
  
  return (
    <>
      {/* Skybox */}
      <color attach="background" args={['#000015']} />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#3b36e2" />
      <spotLight 
        position={[0, 20, 0]} 
        angle={0.3} 
        penumbra={0.8} 
        intensity={0.8} 
        castShadow 
        color="#ffffff"
      />
      
      {/* Car */}
      <Car 
        position={[0, 0.5, 0]} 
        rotation={[0, 0, 0]} 
        carRef={carRef} 
        cameraRef={cameraRef}
      />
      
      {/* Track segments */}
      {trackData.segments.map((segment, index) => (
        <TrackSegment 
          key={`segment-${index}`}
          position={segment.position}
          rotation={segment.rotation}
          scale={segment.scale}
          color={segment.color}
        />
      ))}
      
      {/* Track curves */}
      {trackData.curves.map((curve, index) => (
        <TrackCurve 
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
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#0a0a1a" />
      </mesh>
      
      {/* Add some environmental effects */}
      <fog attach="fog" args={['#000015', 30, 90]} />
      
      {/* HUD elements */}
      <Text
        position={[-5, 8, -10]}
        rotation={[0, 0, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="left"
        anchorY="top"
      >
        {`Speed: ${Math.abs(speed * 200).toFixed(0)} km/h`}
      </Text>
      
      <Text
        position={[-5, 7, -10]}
        rotation={[0, 0, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="left"
        anchorY="top"
      >
        {`Lap: ${lap}`}
      </Text>
      
      <Text
        position={[-5, 6, -10]}
        rotation={[0, 0, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="left"
        anchorY="top"
      >
        {`Time: ${timeElapsed.toFixed(1)}s`}
      </Text>
      
      {bestLapTime && (
        <Text
          position={[-5, 5, -10]}
          rotation={[0, 0, 0]}
          fontSize={0.5}
          color="#fffa66"
          anchorX="left"
          anchorY="top"
        >
          {`Best Lap: ${bestLapTime.toFixed(1)}s`}
        </Text>
      )}
    </>
  );
};

const RaceGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showControls, setShowControls] = useState(true);
  
  useEffect(() => {
    // Check if we have track data from the previous step
    if (!location.state?.trackData) {
      navigate('/analyze');
      return;
    }
    
    // Hide controls after 5 seconds
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [location, navigate]);
  
  const handleRestart = () => {
    // Refresh the current page to restart the game
    window.location.reload();
  };
  
  const handleExit = () => {
    // Navigate back to home
    navigate('/');
  };
  
  if (!location.state?.trackData) {
    return null;
  }
  
  return (
    <div className="race-game">
      <Canvas 
        shadows 
        camera={{ position: [0, 10, 10], fov: 75 }}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputEncoding: THREE.sRGBEncoding,
          shadowMap: { type: THREE.PCFSoftShadowMap }
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 10, 10]} fov={75} />
        <GameScene trackData={location.state.trackData} />
      </Canvas>
      
      {showControls && (
        <div className="controls-overlay">
          <div className="controls-panel">
            <h2>Controls</h2>
            <div className="control-item">
              <span className="key">W / ↑</span>
              <span className="action">Accelerate</span>
            </div>
            <div className="control-item">
              <span className="key">S / ↓</span>
              <span className="action">Brake/Reverse</span>
            </div>
            <div className="control-item">
              <span className="key">A / ←</span>
              <span className="action">Turn Left</span>
            </div>
            <div className="control-item">
              <span className="key">D / →</span>
              <span className="action">Turn Right</span>
            </div>
            <div className="control-item">
              <span className="key">Space</span>
              <span className="action">Handbrake</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="game-ui">
        <div className="game-buttons">
          <button className="restart-button" onClick={handleRestart}>
            Restart
          </button>
          <button className="exit-button" onClick={handleExit}>
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};


export default RaceGame; 