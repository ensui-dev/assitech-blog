import express from 'express';
import Article from '../models/Article.js';
import articleJob from '../services/articleJob.js';
import aiClient from '../services/aiClient.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/articles - Get all articles
router.get('/', async (req, res) => {
  try {
    const articles = await Article.getAll();
    res.json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch articles',
    });
  }
});

// GET /api/articles/topics - Get AI-generated topic suggestions (admin only)
// IMPORTANT: This must come BEFORE /:id route to avoid matching "topics" as an ID
router.get('/topics', authenticate, requireAdmin, async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;
    const topics = await aiClient.generateTopicSuggestions(count);
    res.json({
      success: true,
      data: topics
    });
  } catch (error) {
    console.error('Error generating topics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate topic suggestions',
    });
  }
});

// POST /api/articles/generate - Generate new article with AI (admin only)
// IMPORTANT: This must come BEFORE /:id route to avoid matching "generate" as an ID
router.post('/generate', authenticate, requireAdmin, async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      });
    }

    const article = await articleJob.generateNow(topic);
    res.status(201).json({
      success: true,
      data: article,
      message: 'Article generated successfully'
    });
  } catch (error) {
    console.error('Error generating article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate article',
    });
  }
});

// POST /api/articles/generate-random - Generate random article with AI (admin only)
// IMPORTANT: This must come BEFORE /:id route to avoid matching "generate-random" as an ID
router.post('/generate-random', authenticate, requireAdmin, async (req, res) => {
  try {
    const article = await articleJob.generateNow();
    res.status(201).json({
      success: true,
      data: article,
      message: 'Random article generated successfully'
    });
  } catch (error) {
    console.error('Error generating random article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate random article',
    });
  }
});

// GET /api/articles/:id - Get single article
// IMPORTANT: This must come AFTER specific routes like /topics, /generate, etc.
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.getById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found',
      });
    }

    res.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch article',
    });
  }
});

// POST /api/articles - Create new article manually (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, content, summary, image_url, author } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Title and content are required'
      });
    }

    const article = await Article.create({
      title,
      content,
      summary: summary || '',
      image_url: image_url || null,
      author: author || req.user.username
    });

    res.status(201).json({
      success: true,
      data: article,
      message: 'Article created successfully'
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create article',
    });
  }
});

// PUT /api/articles/:id - Update article (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, summary, image_url, author } = req.body;

    // Check if article exists
    const existingArticle = await Article.getById(id);
    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Update article
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (summary !== undefined) updates.summary = summary;
    if (image_url !== undefined) updates.image_url = image_url;
    if (author !== undefined) updates.author = author;

    const updatedArticle = await Article.update(id, updates);

    res.json({
      success: true,
      data: updatedArticle,
      message: 'Article updated successfully'
    });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update article'
    });
  }
});

// DELETE /api/articles/:id - Delete article (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if article exists
    const existingArticle = await Article.getById(id);
    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    await Article.delete(id);

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete article'
    });
  }
});

export default router;
