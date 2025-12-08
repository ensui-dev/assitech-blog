import axios from 'axios';

// Using Official Unsplash API
// Get your free API key at: https://unsplash.com/developers

class UnsplashClient {
  constructor() {
    this.apiKey = process.env.UNSPLASH_ACCESS_KEY || '';
    this.apiUrl = 'https://api.unsplash.com';

    // Cache for images to avoid repeated API calls
    this.imageCache = new Map();
  }

  /**
   * Get a random tech image from Unsplash
   * @param {string} query - Search query
   * @returns {Promise<string>} Image URL
   */
  async getRandomImage(query = 'technology') {
    if (!this.apiKey) {
      console.warn('UNSPLASH_ACCESS_KEY not set, no image will be used');
      return null;
    }

    try {
      const response = await axios.get(`${this.apiUrl}/photos/random`, {
        params: {
          query: query,
          orientation: 'landscape',
          content_filter: 'high'
        },
        headers: {
          'Authorization': `Client-ID ${this.apiKey}`
        },
        timeout: 5000
      });

      return response.data.urls.regular;
    } catch (error) {
      console.error('Error fetching from Unsplash:', error.message);
      return null;
    }
  }

  /**
   * Get an image based on article topic
   * @param {string} title - Article title to extract keywords from
   * @returns {Promise<string>} Image URL
   */
  async getImageForArticle(title) {
    // Check cache first
    if (this.imageCache.has(title)) {
      return this.imageCache.get(title);
    }

    const keywords = this.extractKeywords(title);
    const query = keywords[0] || 'technology';

    const imageUrl = await this.getRandomImage(query);

    // Cache the result
    this.imageCache.set(title, imageUrl);

    return imageUrl;
  }

  /**
   * Extract relevant keywords from article title
   * @param {string} title - Article title
   * @returns {Array<string>} Keywords
   */
  extractKeywords(title) {
    const keywords = [];
    const techKeywords = {
      'docker': 'docker',
      'container': 'docker',
      'kubernetes': 'kubernetes',
      'api': 'programming',
      'rest': 'api',
      'database': 'database',
      'postgresql': 'database',
      'sql': 'database',
      'react': 'coding',
      'javascript': 'code',
      'python': 'python',
      'cloud': 'cloud',
      'aws': 'cloud',
      'server': 'server',
      'web': 'web',
      'development': 'coding',
      'programming': 'programming',
      'software': 'software',
      'machine learning': 'ai',
      'artificial intelligence': 'ai',
      'ai': 'ai',
      'devops': 'devops',
      'security': 'security',
      'blockchain': 'blockchain',
      'quantum': 'technology',
    };

    const lowerTitle = title.toLowerCase();

    // Find matching keywords
    for (const [key, value] of Object.entries(techKeywords)) {
      if (lowerTitle.includes(key)) {
        keywords.push(value);
      }
    }

    // If no specific keywords found, use general tech terms
    if (keywords.length === 0) {
      keywords.push('technology', 'computer');
    }

    return keywords;
  }

}

export default new UnsplashClient();
