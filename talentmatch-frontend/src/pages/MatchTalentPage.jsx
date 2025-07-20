import { useState } from 'react';
import axios from 'axios';
import styles from './MatchTalentPage.module.css';

function MatchTalentPage() {
  const [formData, setFormData] = useState({
    projectDescription: '',
  });
  const [results, setResults] = useState([]);
  const [extractedData, setExtractedData] = useState({
    location: '',
    budget: 'Any',
    stylePreferences: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, projectDescription: value });

    const lowerCaseValue = value.toLowerCase();
    let location = extractedData.location;
    let budget = 'Any';
    let stylePreferences = '';

    const budgetMatch = value.match(/\d{5,6}/);
    if (budgetMatch) budget = `₹${budgetMatch[0]}`;
    if (lowerCaseValue.includes('pastel tones')) stylePreferences = 'Pastel tones';
    else if (lowerCaseValue.includes('candid portraits')) stylePreferences = 'Candid portraits';
    else if (lowerCaseValue.includes('vibrant colors')) stylePreferences = 'Vibrant colors';

    setExtractedData({ location, budget, stylePreferences });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectDescription) {
      setError('Please enter a project description');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const response = await axios.post('http://localhost:3000/api/searcher/talents/search', {
        query: formData.projectDescription,
        location: extractedData.location || undefined,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(response.data.creators);
      setSuccess('Search completed successfully');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
      setSuccess('');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Match with the right creative talent</h2>
      <p className={styles.subtitle}>Enter your project details to find the perfect match.</p>
      <div className={styles.formSection}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputWrapper}>
            <select
              className={styles.locationDropdown}
              value={extractedData.location}
              onChange={(e) => setExtractedData({ ...extractedData, location: e.target.value })}
            >
              <option value="">Location</option>
              <option value="Goa">Goa</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Remote">Remote</option>
            </select>
            <input
              id="projectDescription"
              type="text"
              name="projectDescription"
              placeholder="E.g., Need candid portraits with pastel tones in Goa for ₹75000..."
              value={formData.projectDescription}
              onChange={handleChange}
              className={styles.projectDescription}
              required
            />
            <button type="submit" className={styles.submitButton}>
              Find Talent
            </button>
          </div>
        </form>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
      <div className={styles.aiInsights}>
        <div className={styles.insightCard}>
          <h4 className={styles.insightTitle}>Location</h4>
          <p className={styles.insightValue}>{extractedData.location || 'Not detected'}</p>
        </div>
        <div className={styles.insightCard}>
          <h4 className={styles.insightTitle}>Budget</h4>
          <p className={styles.insightValue}>{extractedData.budget}</p>
        </div>
        <div className={styles.insightCard}>
          <h4 className={styles.insightTitle}>Style Preferences</h4>
          <p className={styles.insightValue}>{extractedData.stylePreferences || 'Not detected'}</p>
        </div>
      </div>
      {results.length === 0 && <p className={styles.hint}>Submit to see your top matches!</p>}
      {results.length > 0 && (
        <div className={styles.resultsSection}>
          <h3 className={styles.resultsTitle}>Top Matches</h3>
          {results.map((result, index) => (
            <div key={result._id} className={styles.resultCard}>
              <img
                src={result.pictureUrl || 'https://via.placeholder.com/50'}
                alt={result.name}
                className={styles.profileImage}
              />
              <div>
                <h4 className={styles.resultName}>{`${index + 1}. ${result.name}`}</h4>
                <p className={styles.resultLocation}>{result.location}</p>
                <p className={styles.resultCategories}>
                  {result.category} | {result.experience}
                </p>
                <p className={styles.resultBudget}>Budget: {result.budgetRange}</p>
                <p className={styles.resultDescription}>{result.serviceDescription}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MatchTalentPage;