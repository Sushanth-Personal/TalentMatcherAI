import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import styles from './MatchTalentPage.module.css';

function MatchTalentPage() {
  const [formData, setFormData] = useState({
    projectDescription: '',
    priorities: {
      budget: false,
      responseTime: false,
      experience: false,
      ratings: false,
      completionRate: false,
    },
  });
  const [results, setResults] = useState([]);
  const [extractedData, setExtractedData] = useState({
    location: 'Not detected',
    budget: 'Not detected',
    category: 'Not detected',
    experience: 'Not detected',
    responseTime: 'Not detected',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Debounced function to fetch extracted data
  const fetchExtractedData = useCallback(
    debounce(async (query) => {
      if (!query) {
        setExtractedData({
          location: 'Not detected',
          budget: 'Not detected',
          category: 'Not detected',
          experience: 'Not detected',
          responseTime: 'Not detected',
        });
        return;
      }
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        const response = await axios.post(
          'http://localhost:3000/api/searcher/extract',
          { query },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setExtractedData({
          location: response.data.location || 'Not detected',
          budget: response.data.budget || 'Not detected',
          category: response.data.category || 'Not detected',
          experience: response.data.experience ? `${response.data.experience} years` : 'Not detected',
          responseTime: response.data.responseTime ? `${response.data.responseTime} hours` : 'Not detected',
        });
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to extract data');
        setExtractedData({
          location: 'Not detected',
          budget: 'Not detected',
          category: 'Not detected',
          experience: 'Not detected',
          responseTime: 'Not detected',
        });
      }
    }, 2000),
    []
  );

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    fetchExtractedData(value);
    setError('');
    setSuccess('');
  };

  // Handle priority checkbox changes
  const handlePriorityChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      priorities: { ...formData.priorities, [name]: checked },
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectDescription) {
      setError('Please enter a project description');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const priorities = Object.keys(formData.priorities).filter(key => formData.priorities[key]);
      const response = await axios.post(
        'http://localhost:3000/api/searcher/talents/search',
        {
          query: formData.projectDescription,
          location: extractedData.location !== 'Not detected' ? extractedData.location : null,
          budget: extractedData.budget !== 'Not detected' ? extractedData.budget : null,
          category: extractedData.category !== 'Not detected' ? extractedData.category : null,
          experience: extractedData.experience !== 'Not detected' ? parseFloat(extractedData.experience) : null,
          responseTime: extractedData.responseTime !== 'Not detected' ? parseFloat(extractedData.responseTime) : null,
          priorities,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Search response:', response.data);
      setResults(response.data.creators);
      setSuccess(response.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
      setSuccess('');
    }
  };

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      fetchExtractedData.cancel();
    };
  }, [fetchExtractedData]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Match with the Right Creative Talent</h2>
      <p className={styles.subtitle}>Enter your project details and select priorities to find the perfect match.</p>
      <div className={styles.formSection}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputWrapper}>
            <input
              id="projectDescription"
              type="text"
              name="projectDescription"
              placeholder="E.g., Need a photographer in Lucknow for ₹75000 with 5 years experience, fast response..."
              value={formData.projectDescription}
              onChange={handleChange}
              className={styles.projectDescription}
              required
            />
          </div>
          <div className={styles.prioritySection}>
            <h4 className={styles.priorityTitle}>Select Priorities</h4>
            <label>
              <input
                type="checkbox"
                name="budget"
                checked={formData.priorities.budget}
                onChange={handlePriorityChange}
              />
              Budget
            </label>
            <label>
              <input
                type="checkbox"
                name="responseTime"
                checked={formData.priorities.responseTime}
                onChange={handlePriorityChange}
              />
              Response Time
            </label>
            <label>
              <input
                type="checkbox"
                name="experience"
                checked={formData.priorities.experience}
                onChange={handlePriorityChange}
              />
              Experience
            </label>
            <label>
              <input
                type="checkbox"
                name="ratings"
                checked={formData.priorities.ratings}
                onChange={handlePriorityChange}
              />
              Ratings
            </label>
            <label>
              <input
                type="checkbox"
                name="completionRate"
                checked={formData.priorities.completionRate}
                onChange={handlePriorityChange}
              />
              Completion Rate
            </label>
          </div>
          <button type="submit" className={styles.submitButton}>
            Find Talent
          </button>
        </form>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
      <div className={styles.aiInsights}>
        <div className={styles.insightCard}>
          <h4 className={styles.insightTitle}>Location</h4>
          <p className={styles.insightValue}>{extractedData.location}</p>
        </div>
        <div className={styles.insightCard}>
          <h4 className={styles.insightTitle}>Budget</h4>
          <p className={styles.insightValue}>{extractedData.budget}</p>
        </div>
        <div className={styles.insightCard}>
          <h4 className={styles.insightTitle}>Category</h4>
          <p className={styles.insightValue}>{extractedData.category}</p>
        </div>
        <div className={styles.insightCard}>
          <h4 className={styles.insightTitle}>Experience</h4>
          <p className={styles.insightValue}>{extractedData.experience}</p>
        </div>
        <div className={styles.insightCard}>
          <h4 className={styles.insightTitle}>Response Time</h4>
          <p className={styles.insightValue}>{extractedData.responseTime}</p>
        </div>
      </div>
      {results.length === 0 && <p className={styles.hint}>{success || 'Submit to see your top matches!'}</p>}
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
                  {result.category} | {result.experience} years | {result.responseTime} hours response
                </p>
                <p className={styles.resultBudget}>Budget: {result.budgetRange} | Charges: ₹{result.charges}</p>
                <p className={styles.resultDescription}>{result.serviceDescription}</p>
                <p className={styles.resultRating}>Rating: {result.ratingsAverage} ({result.ratingsCount} reviews)</p>
                <p className={styles.resultCompletion}>Completion Rate: {result.completionRate}%</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MatchTalentPage;