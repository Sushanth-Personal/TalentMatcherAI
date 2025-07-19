import { useState } from 'react';
import styles from './CreatorsDirectoryPage.module.css';

function CreatorsDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    category: '',
    budgetRange: '',
    experienceLevel: '',
  });
  const [creators, setCreators] = useState([
    {
      name: 'Rekha G.',
      location: 'Bengaluru',
      category: 'Photography',
      experience: '6 years',
      budgetRange: '₹50,000 - ₹75,000',
    },
    {
      name: 'Siddharth R.',
      location: 'Mumbai',
      category: 'Photography',
      experience: '4 years',
      budgetRange: '₹40,000 - ₹60,000',
    },
    {
      name: 'Tanvi S.',
      location: 'Goa',
      category: 'Fashion',
      experience: '5 years',
      budgetRange: '₹60,000 - ₹80,000',
    },
  ]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const filteredCreators = creators.filter((creator) => {
    const matchesSearch = creator.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !filters.location || creator.location === filters.location;
    const matchesCategory = !filters.category || creator.category === filters.category;
    const matchesBudget = !filters.budgetRange || creator.budgetRange.includes(filters.budgetRange.split('-')[0]);
    const matchesExperience = !filters.experienceLevel || 
      (filters.experienceLevel === '0-3' && parseInt(creator.experience) <= 3) ||
      (filters.experienceLevel === '4-6' && parseInt(creator.experience) >= 4 && parseInt(creator.experience) <= 6) ||
      (filters.experienceLevel === '7+' && parseInt(creator.experience) >= 7);

    return matchesSearch && matchesLocation && matchesCategory && matchesBudget && matchesExperience;
  });

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Creators Directory</h2>
      <div className={styles.searchSection}>
        <input
          type="text"
          placeholder="Search by name or keyword..."
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
        <div className={styles.filters}>
          <select
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
            className={styles.filterSelect}
          >
            <option value="">All Locations</option>
            <option value="Goa">Goa</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bengaluru">Bengaluru</option>
          </select>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className={styles.filterSelect}
          >
            <option value="">All Categories</option>
            <option value="Photography">Photography</option>
            <option value="Fashion">Fashion</option>
          </select>
          <select
            name="budgetRange"
            value={filters.budgetRange}
            onChange={handleFilterChange}
            className={styles.filterSelect}
          >
            <option value="">All Budgets</option>
            <option value="₹40,000">₹40,000+</option>
            <option value="₹60,000">₹60,000+</option>
          </select>
          <select
            name="experienceLevel"
            value={filters.experienceLevel}
            onChange={handleFilterChange}
            className={styles.filterSelect}
          >
            <option value="">All Experience</option>
            <option value="0-3">0-3 years</option>
            <option value="4-6">4-6 years</option>
            <option value="7+">7+ years</option>
          </select>
        </div>
      </div>
      <div className={styles.creatorsGrid}>
        {filteredCreators.map((creator, index) => (
          <div key={index} className={styles.creatorCard}>
            <img
              src="https://via.placeholder.com/60"
              alt="Profile"
              className={styles.profileImage}
            />
            <div>
              <h4 className={styles.creatorName}>{creator.name}</h4>
              <p className={styles.creatorLocation}>{creator.location}</p>
              <p className={styles.creatorCategory}>{creator.category}</p>
              <p className={styles.creatorExperience}>{creator.experience}</p>
              <p className={styles.creatorBudget}>Budget: {creator.budgetRange}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CreatorsDirectoryPage;