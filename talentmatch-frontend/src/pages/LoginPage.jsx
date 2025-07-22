import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const baseUrl = import.meta.env.VITE_STATUS === 'production' 
    ? import.meta.env.VITE_BASE_URL_PRODUCTION 
    : import.meta.env.VITE_BASE_URL_DEPLOYMENT;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    console.log(baseUrl);
    e.preventDefault();
    try {
      const response = await axios.post(`${baseUrl}/api/auth/login`, formData);
      localStorage.setItem('token', response.data.token);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        const payload = JSON.parse(atob(response.data.token.split('.')[1]));
        if (payload.role === 'admin') {
          navigate('/admin/talent-form');
        } else if (payload.role === 'creator') {
          navigate('/creator');
        } else {
          navigate('/match-talents');
        }
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Login</h2>
      <p className={styles.subtitle}>Access your TalentMatcherAI account</p>
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
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>Login</button>
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className={styles.signupButton}
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;