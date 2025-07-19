import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './LoginPage.module.css';

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', formData);
      const { token, role } = response.data;
      localStorage.setItem('token', token); // Store JWT
      // Redirect based on role
      if (role === 'admin') navigate('/admin/talent-form');
      else if (role === 'talent_searcher') navigate('/match');
      else if (role === 'creator') navigate('/creator');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Login</h2>
      <p className={styles.subtitle}>Sign in to access your account</p>
      <div className={styles.formSection}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter your password"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="role" className={styles.label}>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={styles.roleDropdown}
              required
            >
              <option value="">Select Role</option>
              <option value="talent_searcher">Talent Searcher</option>
              <option value="creator">Creator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submitButton}>Login</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;