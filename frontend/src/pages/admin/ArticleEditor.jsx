import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { articlesApi } from '../../api/client';

function ArticleEditor() {
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    image_url: '',
    author: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (isEditMode) {
      fetchArticle();
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      setFetchLoading(true);
      const response = await articlesApi.getById(id);
      const article = response.data;

      setFormData({
        title: article.title || '',
        summary: article.summary || '',
        content: article.content || '',
        image_url: article.image_url || '',
        author: article.author || '',
      });
    } catch (err) {
      setError('Failed to load article');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditMode) {
        await articlesApi.update(id, formData);
        alert('Article updated successfully!');
      } else {
        await articlesApi.create(formData);
        alert('Article created successfully!');
      }

      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div className="admin-loading">Loading article...</div>;
  }

  return (
    <div className="article-editor">
      <div className="admin-header">
        <h1>{isEditMode ? 'Edit Article' : 'Create New Article'}</h1>
        <p>{isEditMode ? 'Update article details' : 'Manually create a new article'}</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={loading}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="summary">Summary</label>
          <textarea
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            rows="3"
            disabled={loading}
            className="form-textarea"
            placeholder="Brief summary of the article (optional)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows="20"
            disabled={loading}
            className="form-textarea"
            placeholder="Article content (supports Markdown)"
          />
          <p className="form-hint">Supports Markdown formatting</p>
        </div>

        <div className="form-group">
          <label htmlFor="image_url">Image URL</label>
          <input
            type="url"
            id="image_url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            disabled={loading}
            className="form-input"
            placeholder="https://example.com/image.jpg"
          />
          {formData.image_url && (
            <div className="image-preview">
              <img src={formData.image_url} alt="Preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="author">Author</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            disabled={loading}
            className="form-input"
            placeholder="AI Writer"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="button-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="button-primary" disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update Article' : 'Create Article'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ArticleEditor;
