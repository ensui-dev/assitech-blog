import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <h1>AssiTech Blog</h1>
        <p>AI-Generated Tech Articles - Powered by HuggingFace</p>
        <nav className="nav">
          <Link to="/">Home</Link>
          {user ? (
            <>
              <Link to="/admin">Dashboard</Link>
              <button onClick={logout} className="nav-button">Logout</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
