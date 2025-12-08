import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav">
        <div className="admin-nav-content">
          <div className="admin-nav-left">
            <h2>Admin Dashboard</h2>
            <div className="admin-nav-links">
              <Link to="/admin" className="admin-nav-link">
                Articles
              </Link>
              <Link to="/admin/generate" className="admin-nav-link">
                Generate
              </Link>
              <Link to="/admin/create" className="admin-nav-link">
                Create New
              </Link>
              <Link to="/admin/database" className="admin-nav-link">
                Database
              </Link>
            </div>
          </div>
          <div className="admin-nav-right">
            <span className="admin-user-info">
              {user?.username} ({user?.email})
            </span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
            <Link to="/" className="button-link">
              View Site
            </Link>
          </div>
        </div>
      </nav>

      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminDashboard;
