import axios from 'axios';
import dotenv from 'dotenv';
import unsplashClient from './unsplashClient.js';

dotenv.config();

const HUGGINGFACE_API_URL = 'https://router.huggingface.co/v1/chat/completions';
const API_KEY = process.env.HUGGINGFACE_API_KEY;
const MODEL = process.env.HUGGINGFACE_MODEL || 'meta-llama/Llama-3.1-8B-Instruct';

class AIClient {
  constructor() {
    this.apiUrl = HUGGINGFACE_API_URL;
    this.model = MODEL;
    this.headers = {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    };
  }

  async generateText(prompt, maxTokens = 1000) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: maxTokens,
          temperature: 0.7,
          top_p: 0.95,
        },
        { headers: this.headers }
      );

      if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
        return response.data.choices[0].message.content;
      }

      throw new Error('Invalid response from HuggingFace API');
    } catch (error) {
      console.error('Error generating text with HuggingFace:', error.message);
      throw error;
    }
  }

  async generateArticle(topic = null) {
    let selectedTopic = topic;

    // If no topic provided, generate a unique random topic using AI
    if (!selectedTopic) {
      try {
        const topicPrompt = `Generate 1 unique, interesting technology article topic. The topic should be:
- About modern technology, software development, cloud computing, AI, cybersecurity, or related fields
- Engaging and specific
- Suitable for a tech blog article
- Between 5-15 words long

Return ONLY the topic, no numbering or additional text.

Topic:`;

        selectedTopic = await this.generateText(topicPrompt, 50);
        selectedTopic = selectedTopic.trim().replace(/^\d+[\.\)]\s*/, '').trim();
        console.log(`AI-generated random topic: ${selectedTopic}`);
      } catch (error) {
        console.error('Failed to generate random topic with AI, using fallback');
        // Fallback to timestamp-based unique topic
        const fallbackTopics = [
          'The Future of Artificial Intelligence in Healthcare',
          'Understanding Microservices Architecture',
          'The Rise of Edge Computing',
          'Quantum Computing: Beyond the Hype',
          'Sustainable Technology and Green Computing',
          'The Evolution of Web Development Frameworks',
          'Cybersecurity in the Age of IoT',
          'Machine Learning Operations (MLOps) Best Practices',
          'The Impact of 5G on Technology Innovation',
          'Blockchain Beyond Cryptocurrency',
          'Cloud-Native Application Development',
          'The Future of Remote Work Technology',
          'Serverless Architecture Patterns',
          'DevOps Culture and Continuous Integration',
          'The Role of AI in Software Testing',
        ];
        // Use timestamp to ensure different selection each time
        const index = Math.floor((Date.now() / 1000) % fallbackTopics.length);
        selectedTopic = fallbackTopics[index];
      }
    }

    const prompt = `Write a professional blog article about "${selectedTopic}".

The article should:
- Be informative and engaging
- Include an introduction, main points, and conclusion
- Be approximately 500-800 words
- Use clear, professional language

Article:`;

    try {
      console.log(`Generating article about: ${selectedTopic}`);
      const content = await this.generateText(prompt, 1200);

      // Generate a summary
      const summaryPrompt = `Summarize the following article in 2-3 sentences. Return ONLY the summary text, no preamble or labels:\n\n${content}\n\nSummary:`;
      let summary = await this.generateText(summaryPrompt, 150);

      // Strip common AI preamble patterns from summary
      summary = summary
        .replace(/^(Here is a|Here's a|This is a).*?summary.*?:\s*/i, '')
        .replace(/^Summary:\s*/i, '')
        .trim();

      // Get image from Unsplash
      const image_url = await unsplashClient.getImageForArticle(selectedTopic);

      return {
        title: selectedTopic,
        content: content.trim(),
        summary: summary.trim(),
        image_url: image_url,
      };
    } catch (error) {
      console.error('Error generating article:', error.message);

      // Fallback to template article if API fails
      return this.generateFallbackArticle(selectedTopic);
    }
  }

  async generateFallbackArticle(topic) {
    console.log('Using fallback article generation');

    // Get image from Unsplash for fallback article too
    const image_url = await unsplashClient.getImageForArticle(topic);

    return {
      title: topic,
      content: `# ${topic}

Technology continues to evolve at a rapid pace, bringing new opportunities and challenges to businesses and individuals alike. In this article, we explore the key aspects of ${topic.toLowerCase()} and its impact on the modern world.

## Introduction

${topic} represents one of the most significant developments in recent years. As we navigate through an increasingly digital landscape, understanding these concepts becomes crucial for staying competitive and informed.

## Key Considerations

When examining ${topic.toLowerCase()}, several important factors emerge:

1. **Innovation**: The field continues to advance with new breakthroughs and methodologies
2. **Practical Applications**: Real-world use cases demonstrate the value and potential
3. **Future Outlook**: The trajectory suggests continued growth and evolution

## Implementation Strategies

Organizations looking to leverage ${topic.toLowerCase()} should consider a strategic approach that balances innovation with practical constraints. This includes careful planning, resource allocation, and continuous learning.

## Conclusion

As we look to the future, ${topic.toLowerCase()} will undoubtedly play a crucial role in shaping how we work, communicate, and solve problems. Staying informed and adaptable will be key to success in this evolving landscape.`,
      summary: `An exploration of ${topic.toLowerCase()}, examining its current impact and future potential in the technology landscape. This article discusses key considerations and implementation strategies for organizations.`,
      image_url: image_url,
    };
  }

  async generateTopicSuggestions(count = 10) {
    const prompt = `Generate exactly ${count} unique, interesting technology article topics. Each topic should be:
- About modern technology, software development, cloud computing, AI, cybersecurity, or related fields
- Engaging and specific
- Suitable for a tech blog article
- Between 5-15 words long

Format: Return ONLY the topics, one per line, numbered 1-${count}. No additional text or explanation.

Topics:`;

    try {
      const response = await this.generateText(prompt, 300);

      // Parse the response to extract topics
      const lines = response.trim().split('\n').filter(line => line.trim());
      const topics = lines
        .map(line => {
          // Remove numbering and clean up
          return line.replace(/^\d+[\.\)]\s*/, '').trim();
        })
        .filter(topic => topic.length > 10 && topic.length < 150)
        .slice(0, count);

      // If we got fewer topics than requested, add some defaults
      const defaultTopics = [
        'The Evolution of Serverless Architecture',
        'Kubernetes Best Practices for Production',
        'Understanding Zero Trust Security',
        'GraphQL vs REST: Choosing the Right API',
        'Modern CI/CD Pipelines with GitHub Actions',
        'WebAssembly: The Future of Web Performance',
        'Microservices Communication Patterns',
        'Infrastructure as Code with Terraform',
        'Real-time Data Processing with Apache Kafka',
        'Building Scalable APIs with Node.js',
      ];

      while (topics.length < count) {
        const randomDefault = defaultTopics[Math.floor(Math.random() * defaultTopics.length)];
        if (!topics.includes(randomDefault)) {
          topics.push(randomDefault);
        }
      }

      return topics.slice(0, count);
    } catch (error) {
      console.error('Error generating topic suggestions:', error.message);

      // Return shuffled default topics on error
      const defaultTopics = [
        'The Evolution of Serverless Architecture',
        'Kubernetes Best Practices for Production',
        'Understanding Zero Trust Security',
        'GraphQL vs REST: Choosing the Right API',
        'Modern CI/CD Pipelines with GitHub Actions',
        'WebAssembly: The Future of Web Performance',
        'Microservices Communication Patterns',
        'Infrastructure as Code with Terraform',
        'Real-time Data Processing with Apache Kafka',
        'Building Scalable APIs with Node.js',
        'Container Orchestration in Production Environments',
        'Building Resilient Distributed Systems',
        'API Gateway Patterns and Best Practices',
        'Event-Driven Architecture at Scale',
        'Database Sharding Strategies',
        'Modern Authentication and Authorization',
        'Progressive Web Apps: A Complete Guide',
        'Optimizing Frontend Performance',
        'Cloud Cost Optimization Techniques',
        'Monitoring and Observability Best Practices',
      ];

      // Shuffle array using Fisher-Yates algorithm
      const shuffled = [...defaultTopics];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      return shuffled.slice(0, count);
    }
  }
}

export default new AIClient();
