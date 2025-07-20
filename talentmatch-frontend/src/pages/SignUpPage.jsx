import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css'; // Reuse LoginPage styles

function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'searcher', // Default role
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/auth/signup', formData);
      localStorage.setItem('token', response.data.token);
      setSuccess('Sign up successful! Redirecting...');
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
      setError(err.response?.data?.message || 'Sign up failed');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Sign Up</h2>
      <p className={styles.subtitle}>Create your TalentMatcherAI account</p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
            placeholder="Enter your name"
            required
          />
        </div>
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
            className={styles.input}
            required
          >
            <option value="searcher">Talent Searcher</option>
            <option value="creator">Creator</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>Sign Up</button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className={styles.signupButton}
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default SignUpPage;