import { useState } from 'react';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call or matching logic
    const mockResults = [
      {
        name: 'Rekha G.',
        location: 'Bengaluru',
        categories: 'Photography, Travel',
        experience: '6 years',
        budgetRange: '₹50,000 - ₹75,000',
        matchScore: '87%',
        reason: 'Matches on budget, location, style',
      },
      {
        name: 'Siddharth R.',
        location: 'Mumbai',
        categories: 'Photography, Lifestyle',
        experience: '4 years',
        budgetRange: '₹40,000 - ₹60,000',
        matchScore: '75%',
        reason: 'Matches on category, experience',
      },
    ];
    setResults(mockResults);
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
                  {result.categories} | {result.experience}
                </p>
                <p className={styles.resultBudget}>Budget: {result.budgetRange}</p>
                <p className={styles.resultScore}>Match Score: {result.matchScore}</p>
                <p className={styles.resultReason}>{result.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MatchTalentPage;