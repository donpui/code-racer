import axios from 'axios';
import { getDemoRepoData } from '../data/demoRepos';

/**
 * Service to analyze GitHub repositories and extract metrics for track generation
 */
class RepoAnalyzerService {
  constructor() {
    this.baseUrl = 'https://api.github.com';
  }

  /**
   * Parse a GitHub URL into owner and repo
   * @param {string} url - GitHub repository URL
   * @returns {Object} owner and repo name
   */
  parseGitHubUrl(url) {
    // Handle different GitHub URL formats
    const regex = /github\.com\/([^/]+)\/([^/]+)/;
    const match = url.match(regex);
    
    if (match && match.length >= 3) {
      return {
        owner: match[1],
        repo: match[2].replace('.git', '')
      };
    }
    
    throw new Error('Invalid GitHub URL format');
  }

  /**
   * Fetch basic repository information
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} Repository information
   */
  async getRepoInfo(owner, repo) {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch repository information:', error);
      throw error;
    }
  }

  /**
   * Get file structure of the repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} path - Path to get content from (optional)
   * @returns {Promise<Array>} File tree
   */
  async getRepoContents(owner, repo, path = '') {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch repository contents:', error);
      throw error;
    }
  }

  /**
   * Get programming languages used in the repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} Language breakdown
   */
  async getRepoLanguages(owner, repo) {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/languages`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch repository languages:', error);
      throw error;
    }
  }

  /**
   * Get contributors to the repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Array>} List of contributors
   */
  async getRepoContributors(owner, repo) {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/contributors`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch repository contributors:', error);
      throw error;
    }
  }

  /**
   * Analyze a GitHub repository and prepare data for track generation
   * @param {string} repoUrl - GitHub repository URL
   * @returns {Promise<Object>} Analysis data for track generation
   */
  async analyzeRepository(repoUrl) {
    try {
      // Check if we have demo data for this repository first
      const demoData = getDemoRepoData(repoUrl);
      
      if (demoData) {
        console.log("Using demo data for repository:", repoUrl);
        return demoData;
      }
      
      // Continue with normal analysis if no demo data is available
      const { owner, repo } = this.parseGitHubUrl(repoUrl);
      
      // Get basic repo information
      const repoInfo = await this.getRepoInfo(owner, repo);
      
      // Get languages used
      const languages = await this.getRepoLanguages(owner, repo);
      
      // Get contributors
      const contributors = await this.getRepoContributors(owner, repo);
      
      // Get file structure (root level)
      const contents = await this.getRepoContents(owner, repo);
      
      // Analysis metadata for track generation
      return {
        repoName: repoInfo.name,
        repoFullName: repoInfo.full_name,
        description: repoInfo.description,
        stars: repoInfo.stargazers_count,
        forks: repoInfo.forks_count,
        issues: repoInfo.open_issues_count,
        size: repoInfo.size,
        languages: this.processLanguages(languages),
        contributorCount: contributors.length,
        fileCount: this.estimateFileCount(contents, repoInfo.size),
        complexity: this.estimateComplexity(repoInfo, languages, contributors),
        updatedAt: repoInfo.updated_at,
        dependencies: Math.floor(repoInfo.size / 100), // Simplified estimate
        contents: this.processContents(contents)
      };
    } catch (error) {
      console.error('Repository analysis failed:', error);
      throw error;
    }
  }
  
  /**
   * Process and normalize language data
   * @param {Object} languages - Raw language data from API
   * @returns {Object} Processed language percentages
   */
  processLanguages(languages) {
    const total = Object.values(languages).reduce((sum, value) => sum + value, 0);
    const processed = {};
    
    for (const [lang, bytes] of Object.entries(languages)) {
      processed[lang] = Math.round((bytes / total) * 100);
    }
    
    return processed;
  }
  
  /**
   * Estimate total file count based on repo contents and size
   * @param {Array} contents - Repository contents from API
   * @param {number} size - Repository size in KB
   * @returns {number} Estimated file count
   */
  estimateFileCount(contents, size) {
    // A very rough estimation based on repo size and root content count
    // In a real implementation, you would recursively traverse the repo
    const fileCount = contents.filter(item => item.type === 'file').length;
    const dirCount = contents.filter(item => item.type === 'dir').length;
    
    // Assume each directory has ~10 files on average (very rough estimate)
    return fileCount + (dirCount * 10) + Math.floor(size / 50);
  }
  
  /**
   * Estimate code complexity based on various metrics
   * @param {Object} repoInfo - Repository information
   * @param {Object} languages - Language breakdown
   * @param {Array} contributors - Contributors list
   * @returns {Object} Complexity metrics
   */
  estimateComplexity(repoInfo, languages, contributors) {
    // Calculate a complexity score (simplified)
    const sizeScore = Math.min(repoInfo.size / 10000, 10); // 0-10 based on size
    const langCount = Object.keys(languages).length;
    const langScore = Math.min(langCount * 2, 10); // 0-10 based on language diversity
    const contribScore = Math.min(contributors.length / 5, 10); // 0-10 based on contributor count
    
    const totalScore = (sizeScore + langScore + contribScore) / 3;
    
    // Categorize complexity
    let complexity;
    if (totalScore < 3) {
      complexity = 'low';
    } else if (totalScore < 7) {
      complexity = 'medium';
    } else {
      complexity = 'high';
    }
    
    return {
      score: totalScore,
      complexity,
      metrics: {
        size: sizeScore,
        languages: langScore,
        contributors: contribScore
      }
    };
  }
  
  /**
   * Process repository contents for visualization
   * @param {Array} contents - Repository contents
   * @returns {Array} Processed content structure
   */
  processContents(contents) {
    return contents.map(item => ({
      name: item.name,
      path: item.path,
      type: item.type,
      size: item.size || 0
    }));
  }
}

export default new RepoAnalyzerService(); 