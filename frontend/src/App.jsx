import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ArticleManagement from './pages/admin/ArticleManagement';
import ArticleGenerator from './pages/admin/ArticleGenerator';
import ArticleEditor from './pages/admin/ArticleEditor';
import DatabaseManager from './pages/admin/DatabaseManager';
import './styles/App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={
                <>
                  <Header />
                  <Home />
                </>
              }
            />
            <Route
              path="/article/:id"
              element={
                <>
                  <Header />
                  <ArticleDetail />
                </>
              }
            />
            <Route path="/login" element={<Login />} />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<ArticleManagement />} />
              <Route path="generate" element={<ArticleGenerator />} />
              <Route path="create" element={<ArticleEditor />} />
              <Route path="edit/:id" element={<ArticleEditor />} />
              <Route path="database" element={<DatabaseManager />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
