import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import '../styles/RepoAnalyzer.css';
import { getDemoRepoData } from '../data/demoRepos';
import RepoAnalyzerService from '../services/RepoAnalyzer';

const RepoAnalyzer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize with prefilled repo if provided
  const [repoUrl, setRepoUrl] = useState(
    location.state?.prefilledRepo || ''
  );
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate input
    if (!repoUrl || !repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // Check for demo repository data
      const demoData = getDemoRepoData(repoUrl);
      
      if (demoData) {
        // Immediately use demo data without any fetching
        console.log("Using pre-analyzed demo data for:", repoUrl);
        navigate('/build-track', { 
          state: { 
            repoUrl, 
            analysisData: demoData,
            trackData: demoData.trackData // Pass pre-generated track data
          } 
        });
      } else {
        // For non-demo repositories, use the RepoAnalyzer service
        console.log("Analyzing repository:", repoUrl);
        const analysisData = await RepoAnalyzerService.analyzeRepository(repoUrl);
        
        // Navigate to track builder with the analysis data
        navigate('/build-track', { 
          state: { 
            repoUrl, 
            analysisData
          } 
        });
      }
    } catch (error) {
      console.error("Error analyzing repository:", error);
      setError(`Failed to analyze repository: ${error.message || 'Unknown error'}`);
      setIsAnalyzing(false);
    }
  };
  
  // Handle clicking on an example repository
  const handleExampleClick = (exampleRepo) => {
    setRepoUrl(exampleRepo);
    // Immediately submit the form with the selected example
    const demoData = getDemoRepoData(exampleRepo);
    if (demoData) {
      navigate('/build-track', { 
        state: { 
          repoUrl: exampleRepo, 
          analysisData: demoData,
          trackData: demoData.trackData
        } 
      });
    }
  };

  return (
    <div className="repo-analyzer">
      <div className="analyzer-bg">
        <Canvas>
          <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
        </Canvas>
      </div>
      
      <div className="analyzer-content">
        <h1>Repository Analyzer</h1>
        <p className="subtitle">Enter a GitHub repository URL to analyze and create a race track</p>
        
        <form onSubmit={handleSubmit} className="analyzer-form">
          <div className="input-group">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              disabled={isAnalyzing}
              className="repo-input"
            />
            <button 
              type="submit" 
              className="analyze-btn"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </form>
        
        <div className="examples">
          <h3>Example repositories (demo data)</h3>
          <div className="example-list">
            <button 
              className="example-repo"
              onClick={() => handleExampleClick('donpui/winden')}
              disabled={isAnalyzing}
            >
              donpui/winden
            </button>
            {/* Add more example buttons as needed */}
          </div>
          <p className="demo-note">
            Note: These example repositories use pre-analyzed data and don't require fetching from GitHub. You can analyze any public GitHub repository by entering its URL.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RepoAnalyzer; 