import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AdminTalentFormPage.module.css';

function AdminTalentFormPage() {
  const [talents, setTalents] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [file, setFile] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    const fetchTalents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        const response = await axios.get('http://localhost:3000/api/admin/talents', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTalents(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch talents');
      }
    };
    fetchTalents();
  }, []);

  const validateTalent = (data) => {
    const errors = {};
    if (!data.name) errors.name = 'Name is required';
    if (!data.location) errors.location = 'Location is required';
    else if (!/^[a-zA-Z\s]+$/.test(data.location)) errors.location = 'Location must contain only letters and spaces';
    if (!data.age) errors.age = 'Age is required';
    else if (data.age < 18 || data.age > 100) errors.age = 'Age must be between 18 and 100';
    if (!data.gender) errors.gender = 'Gender is required';
    if (!data.charges) errors.charges = 'Charges are required';
    else if (data.charges < 0) errors.charges = 'Charges cannot be negative';
    if (!data.services) errors.services = 'Services are required';
    if (!data.serviceDescription) errors.serviceDescription = 'Service description is required';
    if (!data.specialHighlights) errors.specialHighlights = 'Special highlights are required';
    if (!data.pictureUrl) errors.pictureUrl = 'Picture URL is required';
    else if (!/^(https?:\/\/[^\s$.?#].[^\s]*)$/.test(data.pictureUrl)) errors.pictureUrl = 'Invalid URL';
    if (!data.contact) errors.contact = 'Contact is required';
    if (!data.availability) errors.availability = 'Availability is required';
    if (!data.category) errors.category = 'Category is required';
    return errors;
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setSuccess('');
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select a JSON file');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          if (!Array.isArray(jsonData) || jsonData.length === 0) {
            setError('Invalid JSON format: Must be a non-empty array');
            return;
          }

          const token = localStorage.getItem('token');
          if (!token) throw new Error('No authentication token found');
          const errors = [];
          const createdTalents = [];

          for (const talent of jsonData) {
            const data = {
              ...talent,
              services: typeof talent.services === 'string' ? talent.services.split(',').map((s) => s.trim()).filter((s) => s) : talent.services || [],
              specialHighlights: typeof talent.specialHighlights === 'string' ? talent.specialHighlights.split(',').map((s) => s.trim()).filter((s) => s) : talent.specialHighlights || [],
            };

            const validationErrors = validateTalent(data);
            if (Object.keys(validationErrors).length > 0) {
              errors.push({ talent: talent.name || 'Unknown', errors: validationErrors });
              continue;
            }

            try {
              const response = await axios.post('http://localhost:3000/api/admin/talents', data, {
                headers: { Authorization: `Bearer ${token}` },
              });
              createdTalents.push(response.data.creator);
            } catch (err) {
              errors.push({ talent: talent.name || 'Unknown', message: err.response?.data?.message || 'Failed to add talent' });
            }
          }

          if (createdTalents.length > 0) {
            setTalents([...talents, ...createdTalents]);
            setSuccess(`Successfully added ${createdTalents.length} talent(s)`);
          }
          if (errors.length > 0) {
            setError(`Failed to add some talents: ${JSON.stringify(errors, null, 2)}`);
          }
          setFile(null);
          document.getElementById('fileInput').value = ''; // Reset file input
          setShowUpload(false); // Hide upload section after submission
        } catch (err) {
          setError('Invalid JSON format');
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setError('Error reading file');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Add New Talent</h2>
      <p className={styles.subtitle}>Upload a JSON file to add talents</p>
      <div className={styles.uploadSection}>
        {!showUpload ? (
          <button
            onClick={() => setShowUpload(true)}
            className={styles.submitButton}
          >
            Add Talent
          </button>
        ) : (
          <div className={styles.fileInputWrapper}>
            <input
              type="file"
              id="fileInput"
              accept=".json"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
            <button
              onClick={handleFileUpload}
              className={styles.uploadButton}
              disabled={!file}
            >
              Upload JSON
            </button>
            <button
              onClick={() => {
                setShowUpload(false);
                setFile(null);
                document.getElementById('fileInput').value = '';
              }}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
      <div className={styles.talentsSection}>
        <h3 className={styles.talentsTitle}>Existing Talents</h3>
        {talents.length === 0 && <p className={styles.hint}>No talents added yet.</p>}
        {talents.map((talent) => (
          <div key={talent._id} className={styles.talentCard}>
            <img src={talent.pictureUrl} alt={talent.name} className={styles.profileImage} />
            <div>
              <h4 className={styles.talentName}>{talent.name}</h4>
              <p className={styles.talentLocation}>{talent.location}</p>
              <p className={styles.talentDetails}>
                {talent.category} | {talent.experience} | {talent.budgetRange}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminTalentFormPage;