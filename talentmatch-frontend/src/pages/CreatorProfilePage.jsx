import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './CreatorProfilePage.module.css';

function CreatorProfilePage() {
  const [formData, setFormData] = useState({
    name: '', location: '', age: '', gender: '', charges: '', services: '',
    serviceDescription: '', specialHighlights: '', pictureUrl: '', contact: '',
    availability: '', category: '', experience: '', budgetRange: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        const response = await axios.get('http://localhost:3000/api/creator/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({
          ...response.data,
          services: response.data.services.join(', '),
          specialHighlights: response.data.specialHighlights.join(', '),
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile');
      }
    };
    fetchProfile();
  }, []);

  const validateForm = (data) => {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: '' });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const data = {
        ...formData,
        services: formData.services.split(',').map((s) => s.trim()).filter((s) => s),
        specialHighlights: formData.specialHighlights.split(',').map((s) => s.trim()).filter((s) => s),
      };
      await axios.put('http://localhost:3000/api/creator/profile', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Edit Your Profile</h2>
      <p className={styles.subtitle}>Update your talent profile</p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`${styles.input} ${formErrors.name ? styles.inputError : ''}`}
            placeholder="Enter talent name"
            required
          />
          {formErrors.name && <p className={styles.error}>{formErrors.name}</p>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="location" className={styles.label}>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={`${styles.input} ${formErrors.location ? styles.inputError : ''}`}
            placeholder="Enter location (e.g., Mumbai)"
            required
          />
          {formErrors.location && <p className={styles.error}>{formErrors.location}</p>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="age" className={styles.label}>Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className={`${styles.input} ${formErrors.age ? styles.inputError : ''}`}
            placeholder="Enter age (18-100)"
            required
            min="18"
            max="100"
          />
          {formErrors.age && <p className={styles.error}>{formErrors.age}</p>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="gender" className={styles.label}>Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`${styles.dropdown} ${formErrors.gender ? styles.inputError : ''}`}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
          {formErrors.gender && <p className={styles.error}>{formErrors.gender}</p>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="charges" className={styles.label}>Charges (₹)</label>
          <input
            type="number"
            name="charges"
            value={formData.charges}
            onChange={handleChange}
            className={`${styles.input} ${formErrors.charges ? styles.inputError : ''}`}
            placeholder="Enter charges (e.g., 75000)"
            required
            min="0"
          />
          {formErrors.charges && <p className={styles.error}>{formErrors.charges}</p>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="services" className={styles.label}>Services (comma-separated)</label>
          <input
            type="text"
            name="services"
            value={formData.services}
            onChange={handleChange}
            className={`${styles.input} ${formErrors.services ? styles.inputError : ''}`}
            placeholder="E.g., Photography, Videography"
            required
          />
          {formErrors.services && <p className={styles.error}>{formErrors.services}</p>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="serviceDescription" className={styles.label}>Service Description</label>
          <textarea
            name="serviceDescription"
            value={formData.serviceDescription}
            onChange={handleChange}
            className={`${styles.textarea} ${formErrors.serviceDescription ? styles.inputError : ''}`}
            placeholder="Describe the services offered"
            required
          />
          {formErrors.serviceDescription && <p className={styles.error}>{formErrors.serviceDescription}</p>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="specialHighlights" className={styles.label}>Special Highlights (comma-separated)</label>
          <input
            type="text"
            name="specialHighlights"
            value={formData.specialHighlights}
            onChange={handleChange}
            className={`${styles.input} ${formErrors.specialHighlights ? styles.inputError : ''}`}
            placeholder="E.g., Award-winning, 10+ years experience"
            required
          />
          {formErrors.specialHighlights && <p className={styles.error}>{formErrors.specialHighlights}</p>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="pictureUrl" className={styles.label}>Picture URL</label>
          <input
            type="url"
            name="pictureUrl"
            value={formData.pictureUrl}
            onChange={handleChange}
            className={`${styles.input} ${formErrors.pictureUrl ? styles.inputError : ''}`}
            placeholder="Enter profile picture URL"
            required
          />
          {formErrors.pictureUrl && <p className={styles.error}>{formErrors.pictureUrl}</p>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="contact" className={styles.label}>Contact</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            className={`${styles.input} ${formErrors.contact ? styles.inputError : ''}`}
            placeholder="Enter email or phone"
            required
          />
          {formErrors.contact && <p className={styles.error}>{formErrors.contact}</p>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="availability" className={styles.label}>Availability</label>
          <select
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            className={`${styles.dropdown} ${formErrors.availability ? styles.inputError : ''}`}
            required
          >
            <option value="">Select Availability</option>
            <option value="available">Available</option>
            <option value="partially_available">Partially Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
          {formErrors.availability && <p className={styles.error}>{formErrors.availability}</p>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.label}>Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`${styles.input} ${formErrors.category ? styles.inputError : ''}`}
            placeholder="E.g., Photography"
            required
          />
          {formErrors.category && <p className={styles.error}>{formErrors.category}</p>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="experience" className={styles.label}>Experience</label>
          <input
            type="text"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            className={styles.input}
            placeholder="E.g., 5 years"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="budgetRange" className={styles.label}>Budget Range</label>
          <input
            type="text"
            name="budgetRange"
            value={formData.budgetRange}
            onChange={handleChange}
            className={styles.input}
            placeholder="E.g., ₹50000-₹100000"
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>Update Profile</button>
        </div>
      </form>
    </div>
  );
}

export default CreatorProfilePage;