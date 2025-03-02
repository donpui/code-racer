import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import '../styles/HomePage.css';
import { getDemoRepoData } from '../data/demoRepos';

const HomePage = () => {
  const navigate = useNavigate();
  
  // Navigate directly to track builder with demo data
  const handleDemoRepoClick = (repoIdentifier) => {
    const demoData = getDemoRepoData(repoIdentifier);
    if (demoData) {
      navigate('/build-track', { 
        state: { 
          repoUrl: `https://github.com/${repoIdentifier}`, 
          analysisData: demoData,
          trackData: demoData.trackData
        } 
      });
    }
  };
  
  return (
    <div className="home-page">
      <div className="home-bg">
        <Canvas>
          <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
        </Canvas>
      </div>
      
      <div className="home-content">
        <h1>Code Racer</h1>
        <p className="subtitle">Race through tracks generated from GitHub repositories</p>
        
        <div className="home-buttons">
          <Link to="/analyze" className="primary-btn">Analyze Repository</Link>
          <Link to="/about" className="secondary-btn">How It Works</Link>
        </div>
        
        <div className="featured-repos">
          <h3>Demo Repositories</h3>
          <div className="repo-list">
            <div 
              className="featured-repo" 
              onClick={() => handleDemoRepoClick('donpui/winden')}
            >
              <div className="repo-icon">🔒</div>
              <div className="repo-info">
                <h4>donpui/winden</h4>
                <p>Magic Wormhole web application for secure file transfers</p>
                <div className="repo-langs">
                  <span className="lang ts">TS 88.7%</span>
                  <span className="lang rust">Rust 4.6%</span>
                  <span className="lang html">HTML 3.6%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 