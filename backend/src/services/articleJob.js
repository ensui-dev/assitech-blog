import cron from 'node-cron';
import aiClient from './aiClient.js';
import Article from '../models/Article.js';

class ArticleJob {
  constructor() {
    this.cronExpression = process.env.ARTICLE_GENERATION_CRON || '0 2 * * *'; // Daily at 2 AM
    this.isRunning = false;
  }

  async generateAndSaveArticle(topic = null) {
    if (this.isRunning) {
      console.log('Article generation already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    console.log(`[${new Date().toISOString()}] Starting article generation...`);

    try {
      const articleData = await aiClient.generateArticle(topic);
      const article = await Article.create(articleData);

      console.log(`✓ Article created successfully: "${article.title}" (ID: ${article.id})`);
      return article;
    } catch (error) {
      console.error('Error generating article:', error.message);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  start() {
    console.log(`Starting article generation cron job with schedule: ${this.cronExpression}`);

    cron.schedule(this.cronExpression, async () => {
      await this.generateAndSaveArticle();
    });

    console.log('✓ Cron job scheduled successfully');
  }

  // Method to manually trigger article generation (useful for testing)
  async generateNow(topic = null) {
    return await this.generateAndSaveArticle(topic);
  }
}

export default new ArticleJob();
