import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';

function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsAuthenticated(true);
        setUserRole(payload.role);
      } catch (err) {
        console.error('Invalid token:', err);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
  }, [location.pathname]); // Re-check on route change

  const handleAuthAction = () => {
    if (isAuthenticated) {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUserRole(null);
      navigate('/login');
    } else {
      navigate('/signup');
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>TalentMatcherAI</div>
      <nav className={styles.nav}>
        <Link to="/match-talents" className={`${styles.navLink} ${location.pathname === '/match-talents' ? styles.active : ''}`}>
          Match Talent
        </Link>
        {isAuthenticated && userRole === 'admin' && (
          <Link to="/admin/talent-form" className={`${styles.navLink} ${location.pathname === '/admin/talent-form' ? styles.active : ''}`}>
            Admin Talent Form
          </Link>
        )}
        {isAuthenticated && userRole === 'creator' && (
          <Link to="/creator" className={`${styles.navLink} ${location.pathname === '/creator' ? styles.active : ''}`}>
            My Profile
          </Link>
        )}
        <button
          onClick={handleAuthAction}
          className={`${styles.loginButton} ${location.pathname === '/login' || location.pathname === '/signup' ? styles.active : ''}`}
        >
          {isAuthenticated ? 'Logout' : 'Sign Up'}
        </button>
      </nav>
    </header>
  );
}

export default Header;