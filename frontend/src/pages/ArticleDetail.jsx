import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articlesApi } from '../api/client';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await articlesApi.getById(id);
      setArticle(response.data);
    } catch (err) {
      console.error('Error fetching article:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!article) return <ErrorMessage message="Article not found" />;

  return (
    <div className="main-content">
      <Link to="/" className="back-button">
        Back to Articles
      </Link>
      <article className="article-detail">
        {article.image_url && (
          <div className="article-hero-image">
            <img src={article.image_url} alt={article.title} />
          </div>
        )}
        <h1>{article.title}</h1>
        <div className="article-meta">
          <span className="article-author">By {article.author}</span>
          <span className="article-date">{formatDate(article.created_at)}</span>
        </div>
        <div className="article-content">{article.content}</div>
      </article>
    </div>
  );
}

export default ArticleDetail;
