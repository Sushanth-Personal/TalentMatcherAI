import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import WhyUsSection from './components/WhyUsSection';
import Footer from './components/Footer';
import MatchTalentPage from './pages/MatchTalentPage';
import AboutPage from './pages/AboutPage';
import './App.css';

function App() {
  return (
    <Router>
      <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#fff5e6', color: '#333', minHeight: '100vh' }}>
        <div className = "Header">
          <Header />
        </div>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSection />
                <WhyUsSection />
              </>
            }
          />
          <Route path="/match" element={<MatchTalentPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
        <div className = "footer">
          <Footer />
        </div>
        
      </div>
    </Router>
  );
}

export default App;