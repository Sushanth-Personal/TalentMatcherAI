import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './MatchTalentPage.module.css';

function MatchTalentPage() {
  const [formData, setFormData] = useState({
    projectTitle: '',
    location: '',
    budget: '',
  });
  const [results, setResults] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/creators/match', {
        location: formData.location,
        budget: formData.budget,
        category: 'Photography', // Default for now, can be expanded
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Match with the right creative talent</h2>
      <p className={styles.subtitle}>Get recommended creators tailored to your needs and project.</p>
      <div className={styles.formSection}>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              name="projectTitle"
              placeholder="E.g., travel photographer in Goa for 3 days..."
              value={formData.projectTitle}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">Location</option>
              <option value="Goa">Goa</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bengaluru">Bengaluru</option>
            </select>
            <select
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">Budget</option>
              <option value="75000">₹75,000</option>
              <option value="50000">₹50,000</option>
              <option value="100000">₹1,00,000</option>
            </select>
          </div>
          <button type="submit" className={styles.submitButton}>
            Find Talent
          </button>
        </form>
      </div>
      {results.length > 0 && (
        <div className={styles.resultsSection}>
          <h3 className={styles.resultsTitle}>Results</h3>
          {results.map((result, index) => (
            <div key={index} className={styles.resultCard}>
              <img
                src="https://via.placeholder.com/60"
                alt="Profile"
                className={styles.profileImage}
              />
              <div>
                <h4 className={styles.resultName}>{result.name}</h4>
                <p className={styles.resultLocation}>{result.location}</p>
                <p className={styles.resultCategories}>
                  {result.category} | {result.experience}
                </p>
                <p className={styles.resultBudget}>Budget: {result.budgetRange}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MatchTalentPage;