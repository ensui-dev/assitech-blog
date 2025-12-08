import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesApi } from '../../api/client';

function ArticleManagement() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await articlesApi.getAll();
      setArticles(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await articlesApi.delete(id);
      setArticles(articles.filter((article) => article.id !== id));
      alert('Article deleted successfully');
    } catch (err) {
      alert('Failed to delete article: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="admin-loading">Loading articles...</div>;
  }

  if (error) {
    return <div className="admin-error">Error: {error}</div>;
  }

  return (
    <div className="article-management">
      <div className="admin-header">
        <h1>Article Management</h1>
        <p>Total articles: {articles.length}</p>
      </div>

      <div className="articles-table-container">
        <table className="articles-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id}>
                <td>{article.id}</td>
                <td className="article-title-cell">
                  <Link to={`/article/${article.id}`} target="_blank">
                    {article.title}
                  </Link>
                </td>
                <td>{article.author}</td>
                <td>{formatDate(article.created_at)}</td>
                <td className="actions-cell">
                  <Link
                    to={`/admin/edit/${article.id}`}
                    className="action-button edit-button"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(article.id, article.title)}
                    className="action-button delete-button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ArticleManagement;
