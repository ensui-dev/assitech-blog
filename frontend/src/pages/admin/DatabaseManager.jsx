import { useState } from 'react';
import axios from 'axios';

function DatabaseManager() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleReseed = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    setShowConfirmation(false);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/reseed`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(response.data.message || 'Database reseeded successfully with new AI-generated articles!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reseed database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="database-manager">
      <div className="admin-header">
        <h1>Database Management</h1>
        <p>Manage database operations and content generation</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="management-section">
        <div className="management-card">
          <div className="card-icon">🔄</div>
          <h2>Reseed Database</h2>
          <p className="card-description">
            Delete all existing articles and generate new random AI-powered articles.
            This action cannot be undone.
          </p>

          {!showConfirmation ? (
            <button
              onClick={() => setShowConfirmation(true)}
              className="button-danger"
              disabled={loading}
            >
              Reseed Database
            </button>
          ) : (
            <div className="confirmation-box">
              <p className="warning-text">
                ⚠️ Are you sure? This will permanently delete all articles and create new ones.
              </p>
              <div className="button-group">
                <button
                  onClick={handleReseed}
                  className="button-danger"
                  disabled={loading}
                >
                  {loading ? 'Reseeding...' : 'Yes, Reseed Now'}
                </button>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="button-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="info-box">
          <h3>About Reseeding</h3>
          <ul>
            <li>Deletes all existing articles from the database</li>
            <li>Generates 3 new articles with random topics using AI</li>
            <li>Each reseed produces completely different content</li>
            <li>Uses HuggingFace AI (Microsoft Phi-3 model) for generation</li>
            <li>Takes approximately 30-60 seconds to complete</li>
            <li>Admin user accounts are not affected</li>
            <li>Useful for testing or refreshing demo content</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DatabaseManager;
