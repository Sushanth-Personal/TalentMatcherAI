import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredRole }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (requiredRole && payload.role !== requiredRole) {
        navigate('/match-talents', { replace: true });
      }
    } catch (err) {
      console.error('Invalid token:', err);
      localStorage.removeItem('token');
      navigate('/login', { replace: true });
    }
  }, [navigate, requiredRole]);

  return children;
}

export default ProtectedRoute;