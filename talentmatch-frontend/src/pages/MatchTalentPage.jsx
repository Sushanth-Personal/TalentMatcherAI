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
      'workMode-onsite': false,
      'workMode-remote': false,
    },
  });
  const [results, setResults] = useState([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [finalCheckResults, setFinalCheckResults] = useState([]);
  const [extractedData, setExtractedData] = useState({
    location: 'Not detected',
    budget: 'Not detected',
    category: 'Not detected',
    experience: 'Not detected',
    workMode: 'Not detected',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const baseUrl = import.meta.env.VITE_STATUS === 'production' 
    ? import.meta.env.VITE_BASE_URL_PRODUCTION 
    : import.meta.env.VITE_BASE_URL_DEPLOYMENT;

  const fetchExtractedData = useCallback(
    debounce(async (query) => {
      if (!query) {
        setExtractedData(prev => ({
          ...prev,
          location: 'Not detected',
          budget: 'Not detected',
          category: 'Not detected',
          experience: 'Not detected',
          // Preserve workMode from checkbox if set
          workMode: formData.priorities['workMode-onsite'] ? 'onsite' : formData.priorities['workMode-remote'] ? 'remote' : 'Not detected',
        }));
        setIsExtracting(false);
        return;
      }
      try {
        setIsExtracting(true);
        setIsButtonDisabled(false);
        const prompt = `
          You are a JSON extraction tool. Extract the location (city name), budget (amount with currency, e.g., "₹75000"), category (e.g., "Photography", "Videography"), experience (years, e.g., "5 years"), and workMode (e.g., "remote" or "onsite") from the query below.
           Return *only* a valid JSON object with "location", "budget", "category", "experience", and "workMode" fields.
            Set fields to null if not found. Figure out the category by understanding the requirement, e.g., map tasks to the closest professional category (e.g., "making a cake" → "Bakery"). If no clear category can be interpreted, set category to null. For experience, extract numeric years (e.g., "5 years" → 5). For workMode, extract "remote" or "onsite" if mentioned (e.g., "remote photographer" → "remote"); set to null if not specified or ambiguous. Do not include explanatory text.
          Query: "${query}"
          Examples:
          - Query: "Need a photographer in Lucknow for ₹75000 with 5 years experience, remote" → {"location": "Lucknow", "budget": "₹75000", "category": "Photography", "experience": 5, "workMode": "remote"}
          - Query: "I need someone for making a cake for my wedding budget less than 4000 onsite" → {"location": null, "budget": "₹4000", "category": "Bakery", "experience": null, "workMode": "onsite"}
          Output:
        `;
        const response = await puter.ai.chat(prompt, { model: 'o3-mini' });
        const result = JSON.parse(response);
        setExtractedData(prev => ({
          location: result.location || 'Not detected',
          budget: result.budget || 'Not detected',
          category: result.category || 'Not detected',
          experience: result.experience ? `${result.experience} years` : 'Not detected',
          // Preserve workMode from checkbox if set, else use extracted value
          workMode: formData.priorities['workMode-onsite'] ? 'onsite' : formData.priorities['workMode-remote'] ? 'remote' : result.workMode || 'Not detected',
        }));
        setError('');
      } catch (err) {
        console.error('Puter.js error:', err);
        setError('Failed to extract data');
        setExtractedData(prev => ({
          ...prev,
          location: 'Not detected',
          budget: 'Not detected',
          category: 'Not detected',
          experience: 'Not detected',
          // Preserve workMode from checkbox if set
          workMode: formData.priorities['workMode-onsite'] ? 'onsite' : formData.priorities['workMode-remote'] ? 'remote' : 'Not detected',
        }));
      } finally {
        setIsExtracting(false);
      }
    }, 2000),
    [formData.priorities] // Add dependency to preserve checkbox state
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    fetchExtractedData(value);
    setError('');
    setSuccess('');
    setIsButtonDisabled(true);
  };

  const handlePriorityChange = (e) => {
    const { name, checked } = e.target;
    // Ensure only one workMode priority is selected
    let newPriorities = { ...formData.priorities, [name]: checked };
    if (name === 'workMode-onsite' && checked) {
      newPriorities['workMode-remote'] = false;
    } else if (name === 'workMode-remote' && checked) {
      newPriorities['workMode-onsite'] = false;
    }
    setFormData({ ...formData, priorities: newPriorities });
    // Update extractedData.workMode based on checkbox
    setExtractedData(prev => ({
      ...prev,
      workMode: name === 'workMode-onsite' && checked ? 'onsite' : name === 'workMode-remote' && checked ? 'remote' : (!newPriorities['workMode-onsite'] && !newPriorities['workMode-remote'] ? 'Not detected' : prev.workMode),
    }));
  };

  const handleSubmit = async (e) => {
    console.log(baseUrl)
    e.preventDefault();
    if (!formData.projectDescription) {
      setError('Please enter a project description');
      return;
    }
    try {
      setIsSearching(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const priorities = Object.keys(formData.priorities).filter(key => formData.priorities[key]);
      const response = await axios.post(
        `${baseUrl}/api/searcher/talents/search`,
        {
          query: formData.projectDescription,
          location: extractedData.location !== 'Not detected' ? extractedData.location : null,
          budget: extractedData.budget !== 'Not detected' ? extractedData.budget : null,
          category: extractedData.category !== 'Not detected' ? extractedData.category : null,
          experience: extractedData.experience !== 'Not detected' ? parseFloat(extractedData.experience) : null,
          workMode: extractedData.workMode !== 'Not detected' ? extractedData.workMode : null,
          priorities,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Search response:', response.data);
      setResults(response.data.creators);
      setFinalCheckResults(response.data.finalCheck);
      setSuccess(response.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
      setSuccess('');
    } finally {
      setIsSearching(false);
    }
  };

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
              placeholder="E.g., Need a photographer in Lucknow for ₹75000 with 5 years experience, remote..."
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
            <label>
              <input
                type="checkbox"
                name="workMode-onsite"
                checked={formData.priorities['workMode-onsite']}
                onChange={handlePriorityChange}
              />
              Work Mode: Onsite
            </label>
            <label>
              <input
                type="checkbox"
                name="workMode-remote"
                checked={formData.priorities['workMode-remote']}
                onChange={handlePriorityChange}
              />
              Work Mode: Remote
            </label>
          </div>
          <button type="submit" className={styles.submitButton} disabled={isSearching || isExtracting || isButtonDisabled}>
            {isSearching ? (
              <div className={styles.buttonSpinnerContainer}>
                <div className={styles.buttonSpinner}></div>
                <span>Searching for talent...</span>
              </div>
            ) : isExtracting ? (
              <div className={styles.buttonSpinnerContainer}>
                <div className={styles.buttonSpinner}></div>
                <span>Extracting details...</span>
              </div>
            ) : (
              'Find Talent'
            )}
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
          <h4 className={styles.insightTitle}>Work Mode</h4>
          <p className={styles.insightValue}>{extractedData.workMode}</p>
        </div>
      </div>
      {results.length === 0 && <p className={styles.hint}>{success || 'Submit to see your top matches!'}</p>}
      {results.length > 0 && (
        <div className={styles.resultsSection}>
          <h3 className={styles.resultsTitle}>Top 3 Matches</h3>
          {results.map((result, index) => {
            const finalCheck = finalCheckResults.find(check => check.id === result._id) || {
              comment: 'No comment available',
            };
            return (
              <div key={result._id} className={styles.resultCard}>
                <div>
                  <h4 className={styles.resultName}>{`${index + 1}. ${result.name}`}</h4>
                  <p className={styles.resultLocation}>{result.location}</p>
                  <p className={styles.resultCategories}>
                    {result.category} | {result.experience} years | {result.workMode}
                  </p>
                  <p className={styles.resultBudget}>Budget: {result.budgetRange} | Charges: ₹{result.charges}</p>
                  <p className={styles.resultDescription}>{result.serviceDescription}</p>
                  <div className={styles.glassComment}>
                    <p>{finalCheck.comment}</p>
                  </div>
                  <p className={styles.resultRating}>Rating: {result.ratingsAverage} ({result.ratingsCount} reviews)</p>
                  <p className={styles.resultCompletion}>Completion Rate: {result.completionRate}%</p>
                </div>
                <img
                  src={result.pictureUrl || 'https://via.placeholder.com/50'}
                  alt={result.name}
                  className={styles.profileImage}
                />
              </div>
            );
          })}
        </div>
      )}
      <script src="https://js.puter.com/v2/"></script>
    </div>
  );
}

export default MatchTalentPage;