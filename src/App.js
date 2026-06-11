import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import SeekerDashboard from './pages/SeekerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import './App.css';
import JobDetailPage from './pages/JobDetailPage';



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/seeker/dashboard"
            element={
              <ProtectedRoute role="SEEKER">
                <SeekerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute role="EMPLOYER">
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/jobs/:id" element={<JobDetailPage />} 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;