import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <h1>AssiTech Blog</h1>
        <p>AI-Generated Tech Articles - Powered by HuggingFace</p>
        <nav className="nav">
          <Link to="/">Home</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
