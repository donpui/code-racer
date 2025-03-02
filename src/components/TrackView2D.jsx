import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/TrackView2D.css';

const TrackView2D = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [trackData, setTrackData] = useState(null);
  const [disconnectedSegments, setDisconnectedSegments] = useState([]);
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [connectionStyle, setConnectionStyle] = useState("#00ff00");
  
  useEffect(() => {
    // Check if we have track data
    if (!location.state?.trackData) {
      navigate('/analyze');
      return;
    }
    
    setTrackData(location.state.trackData);
    
    // Find potentially disconnected segments
    if (location.state.trackData) {
      findDisconnectedSegments(location.state.trackData);
    }
  }, [location, navigate]);
  
  useEffect(() => {
    if (trackData && canvasRef.current) {
      drawTrack();
    }
  }, [trackData, disconnectedSegments, selectedSegments]);
  
  const findDisconnectedSegments = (data) => {
    // This is a simplified approach to find potentially disconnected segments
    // A more sophisticated algorithm would analyze the actual 3D positions and rotations
    
    const segments = [...data.segments];
    const disconnected = [];
    
    // Find segments that might be disconnected (this is a simple example algorithm)
    for (let i = 0; i < segments.length - 1; i++) {
      const current = segments[i];
      const next = segments[i + 1];
      
      // Calculate distance between end of current segment and start of next
      const distance = calculateEndToStartDistance(current, next);
      
      // If distance is greater than threshold, consider them disconnected
      if (distance > 15) {
        disconnected.push({
          start: i,
          end: i + 1,
          distance: distance
        });
      }
    }
    
    setDisconnectedSegments(disconnected);
  };
  
  const calculateEndToStartDistance = (segment1, segment2) => {
    // In a real implementation, this would calculate the actual 3D distance
    // between the end of one segment and the start of another
    // Simplified version:
    const pos1 = segment1.position;
    const pos2 = segment2.position;
    
    return Math.sqrt(
      Math.pow(pos1[0] - pos2[0], 2) + 
      Math.pow(pos1[1] - pos2[1], 2) + 
      Math.pow(pos1[2] - pos2[2], 2)
    );
  };
  
  const drawTrack = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, width, height);
    
    if (!trackData) return;
    
    // Calculate bounds to center the track
    const bounds = calculateTrackBounds(trackData);
    const scale = calculateScale(bounds, width, height);
    const offset = calculateOffset(bounds, scale, width, height);
    
    // Draw track segments
    trackData.segments.forEach((segment, index) => {
      const x = segment.position[0] * scale + offset.x;
      const y = segment.position[2] * scale + offset.y; // Using z coordinate for 2D representation
      
      // Draw segment
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(segment.rotation[1]); // Use y rotation for 2D
      
      ctx.fillStyle = segment.color;
      const width = segment.scale.x * scale;
      const length = segment.scale.z * scale;
      ctx.fillRect(-width/2, -length/2, width, length);
      
      // Draw index number
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.fillText(index.toString(), 0, 0);
      
      ctx.restore();
    });
    
    // Draw curves
    trackData.curves.forEach((curve, index) => {
      const x = curve.position[0] * scale + offset.x;
      const y = curve.position[2] * scale + offset.y;
      
      ctx.beginPath();
      ctx.arc(x, y, 5 * scale, 0, 2 * Math.PI);
      ctx.fillStyle = curve.complexity > 7 ? "#ff3d3d" : "#ffa500";
      ctx.fill();
    });
    
    // Draw manual connections
    selectedSegments.forEach(connection => {
      if (connection.length === 2) {
        const start = trackData.segments[connection[0]];
        const end = trackData.segments[connection[1]];
        
        const startX = start.position[0] * scale + offset.x;
        const startY = start.position[2] * scale + offset.y;
        const endX = end.position[0] * scale + offset.x;
        const endY = end.position[2] * scale + offset.y;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = connectionStyle;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });
    
    // Highlight disconnected segments
    disconnectedSegments.forEach(gap => {
      const start = trackData.segments[gap.start];
      const end = trackData.segments[gap.end];
      
      const startX = start.position[0] * scale + offset.x;
      const startY = start.position[2] * scale + offset.y;
      const endX = end.position[0] * scale + offset.x;
      const endY = end.position[2] * scale + offset.y;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
    });
  };
  
  const calculateTrackBounds = (trackData) => {
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    
    // Check all segments
    trackData.segments.forEach(segment => {
      const [x, _, z] = segment.position;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    });
    
    // Check all curves
    trackData.curves.forEach(curve => {
      const [x, _, z] = curve.position;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    });
    
    return { minX, maxX, minZ, maxZ };
  };
  
  const calculateScale = (bounds, width, height) => {
    const trackWidth = bounds.maxX - bounds.minX;
    const trackHeight = bounds.maxZ - bounds.minZ;
    
    // Add padding
    const padding = 50;
    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2;
    
    // Calculate scale to fit track in canvas
    return Math.min(
      availableWidth / trackWidth,
      availableHeight / trackHeight
    );
  };
  
  const calculateOffset = (bounds, scale, width, height) => {
    const trackWidth = (bounds.maxX - bounds.minX) * scale;
    const trackHeight = (bounds.maxZ - bounds.minZ) * scale;
    
    // Center track in canvas
    return {
      x: (width - trackWidth) / 2 - bounds.minX * scale,
      y: (height - trackHeight) / 2 - bounds.minZ * scale
    };
  };
  
  const handleSegmentSelect = (e) => {
    const segmentIndex = parseInt(e.target.value);
    
    setSelectedSegments(prev => {
      const newSelection = [...prev];
      
      // If we already have a connection with this segment, remove it
      const existingConnectionIndex = newSelection.findIndex(
        conn => conn.includes(segmentIndex)
      );
      
      if (existingConnectionIndex !== -1) {
        newSelection.splice(existingConnectionIndex, 1);
      }
      
      // If we have less than 2 segments selected, add this one
      if (newSelection.length === 0) {
        newSelection.push([segmentIndex]);
      } else if (newSelection.length === 1) {
        // Don't allow connecting a segment to itself
        if (newSelection[0][0] !== segmentIndex) {
          newSelection[0].push(segmentIndex);
        }
      } else {
        // Start a new connection
        newSelection.splice(0, newSelection.length, [segmentIndex]);
      }
      
      return newSelection;
    });
  };
  
  const handleCreateConnection = () => {
    if (selectedSegments.length === 1 && selectedSegments[0].length === 2) {
      // In a real implementation, you would update the track data here
      // and create a new connecting segment between the selected segments
      
      // For now, we'll just keep the visual connection
      console.log("Creating connection between segments:", selectedSegments[0]);
      
      // Remove this gap from disconnected segments list
      setDisconnectedSegments(prev => 
        prev.filter(gap => 
          !(gap.start === selectedSegments[0][0] && gap.end === selectedSegments[0][1]) &&
          !(gap.start === selectedSegments[0][1] && gap.end === selectedSegments[0][0])
        )
      );
    }
  };
  
  return (
    <div className="track-view-2d">
      <div className="track-view-header">
        <h1>2D Track View</h1>
        <p>View and edit your generated track</p>
      </div>
      
      <div className="track-view-container">
        <div className="track-canvas-container">
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={600}
            className="track-canvas"
          />
        </div>
        
        <div className="track-editor">
          <div className="disconnected-segments">
            <h3>Potential Gaps in Track ({disconnectedSegments.length})</h3>
            <ul>
              {disconnectedSegments.map((gap, index) => (
                <li key={index}>
                  Segment {gap.start} to {gap.end} - Distance: {gap.distance.toFixed(2)} units
                </li>
              ))}
            </ul>
          </div>
          
          <div className="connection-editor">
            <h3>Create Manual Connection</h3>
            <div className="segment-selector">
              <label>Select Segments:</label>
              <select onChange={handleSegmentSelect}>
                <option value="">-- Select Segment --</option>
                {trackData && trackData.segments.map((_, index) => (
                  <option key={index} value={index}>Segment {index}</option>
                ))}
              </select>
            </div>
            
            <div className="selected-segments">
              <p>Selected: {selectedSegments.length > 0 ? 
                selectedSegments[0].map(seg => `Segment ${seg}`).join(' and ') : 
                'None'}
              </p>
            </div>
            
            <div className="connection-style">
              <label>Connection Style:</label>
              <select onChange={(e) => setConnectionStyle(e.target.value)}>
                <option value="#00ff00">Green - Standard</option>
                <option value="#ffff00">Yellow - Warning</option>
                <option value="#ff00ff">Pink - Special</option>
                <option value="#00ffff">Cyan - Interface</option>
              </select>
            </div>
            
            <button 
              className="create-connection-button"
              onClick={handleCreateConnection}
              disabled={!selectedSegments.length || selectedSegments[0].length !== 2}
            >
              Create Connection
            </button>
          </div>
          
          <div className="track-actions">
            <button onClick={() => navigate('/race', { state: { trackData } })}>
              Return to 3D View
            </button>
            <button onClick={() => navigate('/build-track')}>
              Rebuild Track
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackView2D; 