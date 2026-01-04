import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/base/reset.css';
import './styles/base/variables.css';
import './styles/base/global.css';

// Pages
import Homepage from './pages/home/Homepage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOTP from './pages/auth/VerifyOTP';
import ClientDashboard from './pages/dashboard/ClientDashboard';
import LawyerDashboard from './pages/dashboard/LawyerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

import { ToastProvider } from './components/common/Toast';

import UserProfile from './pages/profile/UserProfile';
import LawyerList from './pages/lawyers/LawyerList';
import LawyerDetails from './pages/lawyers/LawyerDetails';
import EditLawyerProfile from './pages/lawyers/EditLawyerProfile';
import ResourceList from './pages/resources/ResourceList';
import ResourceDetails from './pages/resources/ResourceDetails';

import CreateCase from './pages/cases/CreateCase';
import CaseList from './pages/cases/CaseList';
import PublicCaseDetails from './pages/cases/PublicCaseDetails';
import MyCases from './pages/cases/MyCases';


import CaseDetails from './pages/cases/CaseDetails';
import EditCase from './pages/cases/EditCase';
import CaseInbox from './pages/lawyer/CaseInbox';
import MyLawyerCases from './pages/lawyer/MyLawyerCases';
import MyClients from './pages/lawyer/MyClients';
import CaseChat from './pages/chat/CaseChat';





import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Protected Route Wrapper (Simplistic)
// Protected Route Wrapper (Simplistic)
const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <div className="main-content" style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />

              {/* Protected Routes */}
              <Route path="/client-dashboard" element={<PrivateRoute><ClientDashboard /></PrivateRoute>} />
              <Route path="/lawyer-dashboard" element={<PrivateRoute><LawyerDashboard /></PrivateRoute>} />
              <Route path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />

              <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
              <Route path="/lawyers" element={<LawyerList />} />
              <Route path="/lawyers/:id" element={<LawyerDetails />} />
              <Route path="/lawyers/edit" element={<PrivateRoute><EditLawyerProfile /></PrivateRoute>} />

              <Route path="/resources" element={<ResourceList />} />
              <Route path="/resources/:id" element={<ResourceDetails />} />



              <Route path="/cases" element={<CaseList />} />
              <Route path="/cases/view/:id" element={<PublicCaseDetails />} />
              <Route path="/cases/create" element={<PrivateRoute><CreateCase /></PrivateRoute>} />


              <Route path="/cases/my" element={<PrivateRoute><MyCases /></PrivateRoute>} />
              <Route path="/cases/:id" element={<PrivateRoute><CaseDetails /></PrivateRoute>} />
              <Route path="/cases/:caseId/communicate" element={<PrivateRoute><CaseChat /></PrivateRoute>} />
              <Route path="/cases/:id/edit" element={<PrivateRoute><EditCase /></PrivateRoute>} />

              <Route path="/lawyer/inbox" element={<PrivateRoute><CaseInbox /></PrivateRoute>} />
              <Route path="/clients" element={<PrivateRoute><MyClients /></PrivateRoute>} />

              <Route path="/lawyer/cases" element={<PrivateRoute><MyLawyerCases /></PrivateRoute>} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
