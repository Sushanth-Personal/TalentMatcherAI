import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import AdminTalentFormPage from './pages/AdminTalentFormPage';
import MatchTalentPage from './pages/MatchTalentPage';
import CreatorProfilePage from './pages/CreatorProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className = "header">
   <Header />
      </div>
   
      <div style={{ paddingTop: '80px' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/match-talents"
            element={
              <ProtectedRoute>
                <MatchTalentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/talent-form"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminTalentFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/creator"
            element={
              <ProtectedRoute requiredRole="creator">
                <CreatorProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<LoginPage/>} />
        </Routes>
      </div>
      <div className ="footer">
        <Footer/>
      </div>
    </Router>
  );
}

export default App;