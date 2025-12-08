import { useState, useEffect } from 'react';
import { articlesApi } from '../api/client';
import ArticleCard from '../components/ArticleCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await articlesApi.getAll();
      setArticles(response.data || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="main-content">
      <h2 style={{ marginBottom: '1rem', fontSize: '2rem' }}>
        Latest Articles
      </h2>
      {articles.length === 0 ? (
        <div className="empty-state">
          <p>No articles yet. Check back soon!</p>
        </div>
      ) : (
        <div className="articles-grid">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
