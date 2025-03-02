import TrackGenerator from './TrackGenerator.js';

// Export a singleton instance
export default new TrackGenerator();

// Also export individual components for testing/reuse
export * from './TrackParameters.js';
export * from './TrackSegmentFactory.js';
export * from './TrackCurveFactory.js';
export * from './TrackConnector.js';
export * from './TrackMathUtils.js'; 