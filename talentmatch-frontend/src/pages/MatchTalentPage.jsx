import { useState, useEffect } from 'react';
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

  const handleChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, projectDescription: value });

    // Simple text extraction logic based on keywords
    const lowerCaseValue = value.toLowerCase();
    let location = extractedData.location; // Preserve dropdown selection unless changed
    let budget = 'Any';
    let stylePreferences = '';

    // Extract budget (basic pattern matching for numbers)
    const budgetMatch = value.match(/\d{5,6}/); // Matches 5-6 digit numbers (e.g., 75000)
    if (budgetMatch) budget = `₹${budgetMatch[0]}`;

    // Extract style preferences
    if (lowerCaseValue.includes('pastel tones')) stylePreferences = 'Pastel tones';
    else if (lowerCaseValue.includes('candid portraits')) stylePreferences = 'Candid portraits';
    else if (lowerCaseValue.includes('vibrant colors')) stylePreferences = 'Vibrant colors';

    setExtractedData({ location, budget, stylePreferences });
  };

  const calculateMatchScore = (creator) => {
    let score = 0;
    if (creator.location.toLowerCase() === extractedData.location.toLowerCase()) score += 2;
    if (extractedData.budget === 'Any' || creator.budgetRange.split('-')[0].replace(/[^0-9]/g, '') <= parseInt(extractedData.budget.replace(/[^0-9]/g, ''))) score += 3;
    if (creator.category.toLowerCase().includes(extractedData.stylePreferences.toLowerCase())) score += 5;
    if (formData.projectDescription.toLowerCase().includes(creator.category.toLowerCase())) score += 3;
    return score;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/creators/match', {
        location: extractedData.location,
        budget: extractedData.budget === 'Any' ? 0 : extractedData.budget,
        category: extractedData.stylePreferences || 'Photography',
      });
      const scoredResults = response.data.map(creator => ({
        ...creator,
        score: calculateMatchScore(creator),
      })).sort((a, b) => b.score - a.score).slice(0, 3);
      setResults(scoredResults);
    } catch (error) {
      console.error('Error fetching matches:', error);
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
      {results.length === 0 && <p className={styles.hint}>Submit to see your top 3 matches!</p>}
      {results.length > 0 && (
        <div className={styles.resultsSection}>
          <h3 className={styles.resultsTitle}>Top 3 Matches</h3>
          {results.map((result, index) => (
            <div key={index} className={styles.resultCard}>
              <img
                src="https://via.placeholder.com/50"
                alt="Profile"
                className={styles.profileImage}
              />
              <div>
                <h4 className={styles.resultName}>{`${index + 1}. ${result.name}`}</h4>
                <p className={styles.resultLocation}>{result.location}</p>
                <p className={styles.resultCategories}>
                  {result.category} | {result.experience}
                </p>
                <p className={styles.resultBudget}>Budget: {result.budgetRange}</p>
                <p className={styles.resultScore}>Match Score: {result.score}/13</p>
                <p className={styles.resultReason}>
                  Rationale: {result.location.toLowerCase() === extractedData.location.toLowerCase() ? 'Location match (+2), ' : ''}{extractedData.budget === 'Any' || result.budgetRange.split('-')[0].replace(/[^0-9]/g, '') <= parseInt(extractedData.budget.replace(/[^0-9]/g, '')) ? 'Budget match (+3), ' : ''}{result.category.toLowerCase().includes(extractedData.stylePreferences.toLowerCase()) ? 'Style match (+5), ' : ''}{formData.projectDescription.toLowerCase().includes(result.category.toLowerCase()) ? 'Description match (+3)' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MatchTalentPage;