import Article from '../models/Article.js';
import User from '../models/User.js';
import pool from '../config/database.js';
import bcrypt from 'bcrypt';
import aiClient from '../services/aiClient.js';

// Generate random seed articles using AI with duplicate prevention
async function generateSeedArticles(count = 3) {
  console.log(`Generating ${count} random seed articles with AI...`);
  const articles = [];
  const usedTitles = new Set();
  const maxAttempts = count * 3; // Allow up to 3x attempts to avoid infinite loops
  let attempts = 0;

  const fallbackTopics = [
    'Cloud-Native Architecture Best Practices',
    'Microservices vs Monoliths: Making the Right Choice',
    'Container Security in Production Environments',
    'Event-Driven Architecture Design Patterns',
    'API Gateway Implementation Strategies',
    'Distributed Tracing and Observability',
    'Zero Trust Network Architecture',
    'GraphQL Schema Design Principles',
    'Real-Time Data Synchronization Techniques',
    'Infrastructure as Code with Modern Tools',
    'Service Mesh Architecture Explained',
    'Database Replication and Sharding',
    'Chaos Engineering in Practice',
    'Cloud Cost Optimization Strategies',
    'Modern Authentication Patterns',
    'Progressive Web App Development',
    'WebAssembly Use Cases',
    'Edge Computing Applications',
    'Serverless Function Optimization',
    'CI/CD Pipeline Best Practices',
  ];

  // Shuffle fallback topics
  const shuffledFallbacks = [...fallbackTopics].sort(() => Math.random() - 0.5);

  while (articles.length < count && attempts < maxAttempts) {
    attempts++;

    try {
      console.log(`  Generating article ${articles.length + 1}/${count} (attempt ${attempts})...`);

      // Generate random article (no topic provided)
      const article = await aiClient.generateArticle();

      // Check for duplicate title
      if (!usedTitles.has(article.title)) {
        articles.push(article);
        usedTitles.add(article.title);
        console.log(`  ✓ Generated unique article: "${article.title}"`);
      } else {
        console.log(`  ⚠ Duplicate detected, retrying: "${article.title}"`);
      }
    } catch (error) {
      console.error(`  ✗ Failed to generate article ${articles.length + 1}:`, error.message);

      // Use fallback topics, ensuring uniqueness
      const fallbackTopic = shuffledFallbacks[articles.length];
      if (fallbackTopic && !usedTitles.has(fallbackTopic)) {
        articles.push({
          title: fallbackTopic,
          content: `# ${fallbackTopic}\n\nThe technology landscape continues to evolve rapidly. This article explores ${fallbackTopic.toLowerCase()} and its impact on modern software development.\n\n## Overview\n\nIn today's fast-paced technology environment, understanding ${fallbackTopic.toLowerCase()} has become increasingly important. Organizations are constantly seeking ways to improve their systems and processes.\n\n## Key Concepts\n\nModern technology stacks emphasize scalability, maintainability, and developer experience. Cloud-native architectures have become the standard for new applications, enabling teams to build resilient and efficient systems.\n\n## Implementation Considerations\n\nWhen implementing these technologies, teams should consider factors such as:\n- Scalability requirements\n- Security implications\n- Team expertise and training needs\n- Integration with existing systems\n- Long-term maintenance\n\n## Best Practices\n\nSuccessful implementation requires careful planning, continuous learning, and adaptation to changing requirements. Teams should stay informed about industry trends and emerging patterns.\n\n## Conclusion\n\nStaying current with technology trends is essential for building competitive applications. By understanding and applying these concepts, development teams can create more robust and maintainable systems.`,
          summary: `An exploration of ${fallbackTopic.toLowerCase()} and its practical applications in modern software development.`,
          image_url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&h=675&fit=crop',
          author: 'AI Writer'
        });
        usedTitles.add(fallbackTopic);
        console.log(`  ✓ Used unique fallback topic: "${fallbackTopic}"`);
      }
    }
  }

  if (articles.length < count) {
    console.warn(`⚠ Only generated ${articles.length} out of ${count} requested articles after ${attempts} attempts`);
  }

  return articles;
}

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');

    // Create tables
    await Article.createTable();
    await User.createTable();

    // Create default admin user if no users exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@assitech.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await User.findByEmail(adminEmail);

    if (!existingAdmin) {
      console.log('Creating default admin user...');
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(adminPassword, saltRounds);

      const admin = await User.create({
        username: 'admin',
        email: adminEmail,
        password_hash,
        role: 'admin'
      });

      console.log(`✓ Created admin user: ${admin.email}`);
      console.log(`  Username: admin`);
      console.log(`  Email: ${adminEmail}`);
      console.log(`  Password: ${adminPassword}`);
      console.log('  ⚠️  Please change the admin password after first login!');
    } else {
      console.log('Admin user already exists, skipping creation');
    }

    // Check if articles already exist
    const count = await Article.count();
    console.log(`Current article count: ${count}`);

    if (count === 0) {
      console.log('Seeding database with randomly generated AI articles...');

      // Generate random articles using AI
      const seedArticles = await generateSeedArticles(3);

      for (const articleData of seedArticles) {
        const article = await Article.create(articleData);
        console.log(`✓ Created article: "${article.title}" (ID: ${article.id})`);
      }

      console.log(`✓ Successfully seeded ${seedArticles.length} articles`);
    } else {
      console.log('Database already contains articles, skipping seed');
    }

    console.log('✓ Database initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
