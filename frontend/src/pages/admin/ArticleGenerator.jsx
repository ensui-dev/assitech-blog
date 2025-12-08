import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { articlesApi } from '../../api/client';

function ArticleGenerator() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [suggestedTopics, setSuggestedTopics] = useState([]);

  const navigate = useNavigate();

  // Load suggested topics from localStorage or generate new ones
  useEffect(() => {
    const cachedTopics = localStorage.getItem('suggestedTopics');
    if (cachedTopics) {
      try {
        setSuggestedTopics(JSON.parse(cachedTopics));
      } catch (e) {
        // If parsing fails, generate new topics
        generateTopics();
      }
    } else {
      generateTopics();
    }
  }, []);

  const generateTopics = async () => {
    setLoadingTopics(true);
    try {
      const response = await articlesApi.getTopicSuggestions(10);
      setSuggestedTopics(response.data);
      // Cache the topics in localStorage
      localStorage.setItem('suggestedTopics', JSON.stringify(response.data));
    } catch (err) {
      console.error('Failed to generate topics:', err);
      // Use shuffled fallback topics
      const allTopics = [
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

      // Shuffle array
      const shuffled = [...allTopics];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      const fallbackTopics = shuffled.slice(0, 10);
      setSuggestedTopics(fallbackTopics);
      localStorage.setItem('suggestedTopics', JSON.stringify(fallbackTopics));
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await articlesApi.generate(topic);
      setSuccess(`Article "${response.data.title}" generated successfully!`);
      setTopic('');

      // Redirect to article management after 2 seconds
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate article');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRandom = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await articlesApi.generateRandom();
      setSuccess(`Random article "${response.data.title}" generated successfully!`);
      setTopic('');

      // Redirect to article management after 2 seconds
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate random article');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshTopics = () => {
    generateTopics();
  };

  return (
    <div className="article-generator">
      <div className="admin-header">
        <h1>Generate Article with AI</h1>
        <p>Use AI to automatically generate a tech article on any topic</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleGenerate} className="generator-form">
        <div className="form-group">
          <label htmlFor="topic">Article Topic *</label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a specific topic (required)"
            disabled={loading}
            className="form-input"
            required
          />
          <p className="form-hint">
            Enter a specific topic to generate an article about
          </p>
        </div>

        <div className="button-group">
          <button type="submit" className="generate-button" disabled={loading}>
            {loading ? 'Generating Article...' : 'Generate Article'}
          </button>
          <button
            type="button"
            onClick={handleGenerateRandom}
            className="generate-random-button"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Random Article'}
          </button>
        </div>
      </form>

      <div className="suggested-topics">
        <div className="suggested-topics-header">
          <h3>AI-Generated Topic Suggestions</h3>
          <button
            onClick={handleRefreshTopics}
            className="refresh-button"
            disabled={loadingTopics}
            title="Generate new topic suggestions"
          >
            {loadingTopics ? '⟳ Loading...' : '⟳ Refresh Topics'}
          </button>
        </div>
        <div className="topics-grid">
          {suggestedTopics.map((suggestedTopic, index) => (
            <button
              key={index}
              onClick={() => setTopic(suggestedTopic)}
              className="topic-chip"
              disabled={loading}
            >
              {suggestedTopic}
            </button>
          ))}
        </div>
        <p className="topics-hint">
          Click a topic to use it, or click refresh to generate new suggestions with AI
        </p>
      </div>

      <div className="info-box">
        <h3>How it works</h3>
        <ul>
          <li>Enter a custom topic or select from AI-generated suggestions</li>
          <li>Click "Generate Article" to create an article about your chosen topic</li>
          <li>Click "Generate Random Article" for a surprise topic</li>
          <li>Articles are generated using HuggingFace AI (Mistral-7B model)</li>
          <li>Images are automatically fetched from Unsplash based on the topic</li>
          <li>Generation typically takes 10-30 seconds</li>
          <li>Articles can be edited after generation</li>
        </ul>
      </div>
    </div>
  );
}

export default ArticleGenerator;
