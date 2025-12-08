import { Link } from 'react-router-dom';

function ArticleCard({ article }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Link to={`/article/${article.id}`} className="article-card-link">
      <article className="article-card">
        {article.image_url && (
          <div className="article-image">
            <img src={article.image_url} alt={article.title} loading="lazy" />
          </div>
        )}
        <div className="article-card-content">
          <h2>{article.title}</h2>
          <div className="article-meta">
            <span className="article-author">By {article.author}</span>
            <span className="article-date">{formatDate(article.created_at)}</span>
          </div>
          <p className="article-summary">{article.summary}</p>
        </div>
      </article>
    </Link>
  );
}

export default ArticleCard;
