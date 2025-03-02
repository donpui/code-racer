import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import RepoAnalyzer from './components/RepoAnalyzer';
import TrackBuilder from './components/TrackBuilder';
import RaceGame from './components/RaceGame';
import TrackView2D from './components/TrackView2D';
import './App.css';

const App = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analyze" element={<RepoAnalyzer />} />
        <Route path="/build-track" element={<TrackBuilder />} />
        <Route path="/track-2d" element={<TrackView2D />} />
        <Route path="/race" element={<RaceGame />} />
      </Routes>
    </div>
  );
};

export default App; 